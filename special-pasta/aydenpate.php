<?php
/*
Plugin Name: AydenPate
Description: Plugin pour composer des plats de pâtes avec des choix de sauces, suppléments, boissons, etc. Modifiable avec Elementor.
Version: 1.0.2
Author: Tourak Adnan
URL: https://tourak-digital.com/
Snapchat: https://snapchat.com/add/ayden3.0of
*/

if (!defined('ABSPATH')) {
    exit;
}

final class AydenPate {
    const VERSION = '1.0.2';

    public function __construct() {
        // Load scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Register custom post types
        add_action('init', array($this, 'register_custom_post_types'));

        // Register Elementor widgets
        add_action('elementor/widgets/widgets_registered', array($this, 'register_elementor_widgets'));

        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // Register settings
        add_action('admin_init', array($this, 'register_settings'));

        // Shortcode for order page
        add_shortcode('aydenpate_order', array($this, 'render_order_page'));

        // AJAX action for adding to cart
        add_action('wp_ajax_aydenpate_add_to_cart', array($this, 'add_to_cart'));
        add_action('wp_ajax_nopriv_aydenpate_add_to_cart', array($this, 'add_to_cart'));

        // AJAX action for delivery tracking
        add_action('wp_ajax_get_delivery_status', array($this, 'get_delivery_status'));
        add_action('wp_ajax_nopriv_get_delivery_status', array($this, 'get_delivery_status'));

        // Endpoint for updating driver location
        add_action('wp_ajax_update_driver_location', array($this, 'update_driver_location'));
    }

    public function enqueue_scripts() {
        wp_enqueue_script('google-maps', 'https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY', null, null, true);
        wp_enqueue_script('aydenpate-script', plugin_dir_url(__FILE__) . 'js/aydenpate.js', array('jquery', 'google-maps'), self::VERSION, true);
        wp_localize_script('aydenpate-script', 'aydenpate_data', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'pasta_options' => $this->get_products_by_category('pasta'),
            'sauce_options' => $this->get_products_by_category('sauce'),
            'cheese_options' => $this->get_products_by_category('cheese'),
            'dessert_options' => $this->get_products_by_category('dessert'),
            'drink_options' => $this->get_products_by_category('drink'),
            'nonce' => wp_create_nonce('aydenpate_nonce'),
            'order_id' => isset($_GET['order_id']) ? sanitize_text_field($_GET['order_id']) : '',
        ));
        wp_enqueue_style('aydenpate-style', plugin_dir_url(__FILE__) . 'css/aydenpate.css');
        wp_enqueue_script('aydenpate-tracking', plugin_dir_url(__FILE__) . 'js/aydenpate-tracking.js', array('jquery', 'google-maps'), self::VERSION, true);
    }

    private function get_options_with_images($option_name) {
        $settings = get_option('aydenpate_settings');
        $options = isset($settings[$option_name]) ? explode("\n", $settings[$option_name]) : [];
        $result = array();

        foreach ($options as $option) {
            $parts = explode('|', $option);
            $name = $parts[0];
            $image = isset($parts[1]) ? $parts[1] : ''; // Set $image to an empty string if it doesn't exist
            $result[] = array('name' => $name, 'image' => $image);
        }

        return $result;
    }

    public function register_custom_post_types() {
        register_post_type('product', array(
            'labels' => array(
                'name' => __('Products', 'aydenpate'),
                'singular_name' => __('Product', 'aydenpate')
            ),
            'public' => true,
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
            'has_archive' => true,
            'show_in_menu' => 'aydenpate',
            'taxonomies' => array('pasta_category'), // Utilisation de la nouvelle taxonomie
        ));

        // Enregistrer la taxonomie personnalisée
        register_taxonomy('pasta_category', 'product', array(
            'labels' => array(
                'name' => __('Pasta Categories', 'aydenpate'),
                'singular_name' => __('Pasta Category', 'aydenpate')
            ),
            'hierarchical' => true,
            'show_admin_column' => true,
            'show_ui' => true,
            'query_var' => true,
            'rewrite' => array('slug' => 'pasta-category'),
        ));
    }

    private function get_products_by_category($category_slug) {
        $args = array(
            'post_type' => 'product',
            'tax_query' => array(
                array(
                    'taxonomy' => 'pasta_category', // Utilisez 'category' si vous utilisez la taxonomie par défaut
                    'field' => 'slug',
                    'terms' => $category_slug,
                ),
            ),
        );
        $query = new WP_Query($args);
        $products = array();

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $products[] = array(
                    'name' => get_the_title(),
                    'image' => get_the_post_thumbnail_url(),
                );
            }
            wp_reset_postdata();
        }

        return $products;
    }


    public function register_elementor_widgets() {
        require_once(plugin_dir_path(__FILE__) . 'widgets/option-widget.php');
        require_once(plugin_dir_path(__FILE__) . 'widgets/tracking-widget.php');

        \Elementor\Plugin::instance()->widgets_manager->register_widget_type(new \Elementor\AydenPate_Option_Widget());
        \Elementor\Plugin::instance()->widgets_manager->register_widget_type(new \Elementor\AydenPate_Tracking_Widget());
    }

    public function add_admin_menu() {
        add_menu_page(
            'AydenPate Settings',
            'AydenPate',
            'manage_options',
            'aydenpate',
            array($this, 'settings_page'),
            'dashicons-food',
            20
        );
    }

    public function register_settings() {
        register_setting('aydenpate_settings_group', 'aydenpate_settings');
        add_settings_section('aydenpate_settings_section', 'Settings', null, 'aydenpate');

        add_settings_field('pasta_options', 'Pasta Options', array($this, 'render_options_field'), 'aydenpate', 'aydenpate_settings_section', array('option_name' => 'pasta_options'));
        add_settings_field('sauce_options', 'Sauce Options', array($this, 'render_options_field'), 'aydenpate', 'aydenpate_settings_section', array('option_name' => 'sauce_options'));
        add_settings_field('cheese_options', 'Cheese Options', array($this, 'render_options_field'), 'aydenpate', 'aydenpate_settings_section', array('option_name' => 'cheese_options'));
        add_settings_field('dessert_options', 'Dessert Options', array($this, 'render_options_field'), 'aydenpate', 'aydenpate_settings_section', array('option_name' => 'dessert_options'));
        add_settings_field('drink_options', 'Drink Options', array($this, 'render_options_field'), 'aydenpate', 'aydenpate_settings_section', array('option_name' => 'drink_options'));
    }

    public function render_options_field($args) {
        $option_name = $args['option_name'];
        $options = get_option('aydenpate_settings')[$option_name];
        ?>
        <textarea name="aydenpate_settings[<?php echo esc_attr($option_name); ?>]" rows="5" cols="50"><?php echo esc_textarea($options ?? ''); ?></textarea>
        <p class="description">Enter each option on a new line. Format: Name|ImageURL</p>
        <?php
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>AydenPate Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('aydenpate_settings_group');
                do_settings_sections('aydenpate');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function render_order_page() {
        ob_start();
        ?>
        <div id="aydenpate-order" class="elementor-widget-container">
            <h2>Composez votre plat</h2>
            <form id="aydenpate-order-form">
                <div id="step-1" class="order-step">
                    <h3>Choix des pâtes :</h3>
                    <div id="pasta-options"></div>
                </div>
                <div id="step-2" class="order-step" style="display: none;">
                    <h3>Choix de la sauce :</h3>
                    <div id="sauce-options"></div>
                </div>
                <div id="step-3" class="order-step" style="display: none;">
                    <h3>Gratiné (3€) :</h3>
                    <div id="cheese-options"></div>
                </div>
                <div id="step-4" class="order-step optional" style="display: none;">
                    <h3>Dessert (3€) :</h3>
                    <div id="dessert-options"></div>
                </div>
                <div id="step-5" class="order-step optional" style="display: none;">
                    <h3>Boissons :</h3>
                    <div id="drink-options"></div>
                </div>
                <div id="delivery-details" style="display: none;">
                    <h3>Détails de livraison</h3>
                    <label for="delivery-date">Date de livraison :</label>
                    <input type="date" id="delivery-date" name="delivery_date" required>
                    <label for="delivery-time">Heure de livraison :</label>
                    <input type="time" id="delivery-time" name="delivery_time" required>
                    <label for="customer-address">Adresse :</label>
                    <input type="text" id="customer-address" name="customer_address" required>
                    <label for="customer-phone">Numéro de téléphone :</label>
                    <input type="tel" id="customer-phone" name="customer_phone" required>
                </div>
                <div id="order-summary" style="display: none;">
                    <h3>Résumé de la commande :</h3>
                    <div id="summary-details"></div>
                    <button type="button" id="add-to-cart">Ajouter au panier</button>
                    <button type="button" id="remove-selection">Supprimer sélection</button>
                </div>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    public function add_to_cart() {
        check_ajax_referer('aydenpate_nonce', 'security'); // Nonce check for security

        $product_id = get_option('aydenpate_product_id');
        if (!$product_id) {
            wp_send_json_error(array('message' => 'Product ID not set.'));
        }

        $quantity = 1;
        $custom_data = array(
            'pasta' => sanitize_text_field($_POST['pasta']),
            'sauce' => sanitize_text_field($_POST['sauce']),
            'cheese' => sanitize_text_field($_POST['cheese']),
            'dessert' => isset($_POST['dessert']) ? sanitize_text_field($_POST['dessert']) : '',
            'drink' => isset($_POST['drink']) ? sanitize_text_field($_POST['drink']) : '',
            'delivery_date' => sanitize_text_field($_POST['delivery_date']),
            'delivery_time' => sanitize_text_field($_POST['delivery_time']),
            'customer_address' => sanitize_text_field($_POST['customer_address']),
            'customer_phone' => sanitize_text_field($_POST['customer_phone']),
        );

        $cart_item_data = array('custom_data' => $custom_data);
        $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity, 0, array(), $cart_item_data);

        if ($cart_item_key) {
            wp_send_json_success();
        } else {
            wp_send_json_error(array('message' => 'Error adding product to cart.'));
        }
    }

    public function get_delivery_status() {
        check_ajax_referer('aydenpate_nonce', 'security'); // Nonce check for security

        $order_id = intval($_POST['order_id']);
        $order = wc_get_order($order_id);

        if ($order) {
            $delivery_status = get_post_meta($order_id, '_delivery_status', true);
            $driver_location = get_post_meta($order_id, '_driver_location', true);

            wp_send_json_success(array(
                'status' => $delivery_status,
                'location' => $driver_location
            ));
        } else {
            wp_send_json_error(array('message' => 'Invalid order ID.'));
        }
    }

    public function update_driver_location() {
        check_ajax_referer('aydenpate_nonce', 'security'); // Nonce check for security

        $order_id = intval($_POST['order_id']);
        $location = sanitize_text_field($_POST['location']);

        if ($order_id && $location) {
            update_post_meta($order_id, '_driver_location', $location);
            wp_send_json_success();
        } else {
            wp_send_json_error(array('message' => 'Invalid data.'));
        }
    }
}

new AydenPate();
?>
