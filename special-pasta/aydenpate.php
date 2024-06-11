<?php
/*
Plugin Name: AydenPate
Description: Plugin pour composer des plats de pâtes avec des choix de sauces, suppléments, boissons, etc. Modifiable avec Elementor.
Version: 1.0.2
Author: tourak adnan
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
            'pasta_options' => $this->get_options_with_images('pasta_options'),
            'sauce_options' => $this->get_options_with_images('sauce_options'),
            'cheese_options' => $this->get_options_with_images('cheese_options'),
            'dessert_options' => $this->get_options_with_images('dessert_options'),
            'drink_options' => $this->get_options_with_images('drink_options'),
            'order_id' => isset($_GET['order_id']) ? sanitize_text_field($_GET['order_id']) : '',
        ));
        wp_enqueue_style('aydenpate-style', plugin_dir_url(__FILE__) . 'css/aydenpate.css');
        wp_enqueue_script('aydenpate-tracking', plugin_dir_url(__FILE__) . 'js/aydenpate-tracking.js', array('jquery', 'google-maps'), self::VERSION, true);
    }

    private function get_options_with_images($option_name) {
        $options = explode("\n", get_option('aydenpate_settings')[$option_name]);
        $result = array();

        foreach ($options as $option) {
            list($name, $image) = explode('|', $option);
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
        ));
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
        echo '<textarea name="aydenpate_settings[' . $option_name . ']" rows="5" cols="50">' . esc_textarea($options ?? '') . '</textarea>';
        echo '<p class="description">Enter each option on a new line. Format: Name|ImageURL</p>';
    }

    public function settings_page() {
        echo '<div class="wrap">';
        echo '<h1>AydenPate Settings</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields('aydenpate_settings_group');
        do_settings_sections('aydenpate');
        submit_button();
        echo '</form>';
        echo '</div>';
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
                </div>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    public function add_to_cart() {
        $product_id = get_option('aydenpate_product_id'); // You should create this option and set a WooCommerce product ID
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

        $cart_item_data = array(
            'custom_data' => $custom_data
        );

        $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity, 0, array(), $cart_item_data);

        if ($cart_item_key) {
            wp_send_json_success();
        } else {
            wp_send_json_error();
        }
    }

    public function get_delivery_status() {
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
            wp_send_json_error();
        }
    }

    public function update_driver_location() {
        $order_id = intval($_POST['order_id']);
        $location = sanitize_text_field($_POST['location']);

        if ($order_id && $location) {
            update_post_meta($order_id, '_driver_location', $location);
            wp_send_json_success();
        } else {
            wp_send_json_error();
        }
    }
}

new AydenPate();
?>
