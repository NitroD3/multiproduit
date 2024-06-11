<?php
namespace Elementor;

class AydenPate_Tracking_Widget extends Widget_Base {
    public function get_name() {
        return 'aydenpate_tracking_widget';
    }

    public function get_title() {
        return __('Tracking Widget', 'aydenpate');
    }

    public function get_icon() {
        return 'eicon-location';
    }

    public function get_categories() {
        return ['basic'];
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
            'title',
            [
                'label' => __('Title', 'aydenpate'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => __('Suivi de livraison', 'aydenpate'),
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        echo '<div class="aydenpate-tracking-widget">';
        echo '<h3>' . $settings['title'] . '</h3>';
        echo '<div id="map" style="width: 100%; height: 400px;"></div>';
        echo '<p id="delivery-status"></p>';
        echo '</div>';
    }

    protected function _content_template() {
        ?>
        <#
        var title = settings.title;
        #>
        <div class="aydenpate-tracking-widget">
            <h3>{{{ title }}}</h3>
            <div id="map" style="width: 100%; height: 400px;"></div>
            <p id="delivery-status"></p>
        </div>
        <?php
    }
}

Plugin::instance()->widgets_manager->register_widget_type(new AydenPate_Tracking_Widget());
?>
