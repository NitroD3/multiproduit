<?php
namespace Elementor;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class AydenPate_Tracking_Widget extends Widget_Base {
    public function get_name() {
        return 'aydenpate_tracking_widget';
    }

    public function get_title() {
        return __('AydenPate Tracking', 'aydenpate');
    }

    public function get_icon() {
        return 'eicon-map-pin';
    }

    public function get_categories() {
        return ['general'];
    }

    protected function _register_controls() {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Content', 'aydenpate'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'order_id',
            [
                'label' => __('Order ID', 'aydenpate'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'input_type' => 'number',
                'default' => 0,
                'placeholder' => __('Enter Order ID', 'aydenpate'),
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        ?>
        <div id="aydenpate-tracking-widget" data-order-id="<?php echo esc_attr($settings['order_id']); ?>">
            <div id="map" style="height: 400px;"></div>
            <div id="status"></div>
        </div>
        <?php
    }

    protected function _content_template() {
        ?>
        <div id="aydenpate-tracking-widget" data-order-id="{{ settings.order_id }}">
            <div id="map" style="height: 400px;"></div>
            <div id="status"></div>
        </div>
        <?php
    }
}
?>
