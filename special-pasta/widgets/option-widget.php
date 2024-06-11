<?php
namespace Elementor;

class AydenPate_Option_Widget extends Widget_Base {
    public function get_name() {
        return 'aydenpate_option_widget';
    }

    public function get_title() {
        return __('Option Widget', 'aydenpate');
    }

    public function get_icon() {
        return 'eicon-restaurant';
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
                'default' => __('Choix des options', 'aydenpate'),
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        echo '<div class="aydenpate-option-widget">';
        echo '<h3>' . $settings['title'] . '</h3>';
        echo '<div id="pasta-options"></div>';
        echo '<div id="sauce-options"></div>';
        echo '<div id="cheese-options"></div>';
        echo '<div id="dessert-options"></div>';
        echo '<div id="drink-options"></div>';
        echo '</div>';
    }

    protected function _content_template() {
        ?>
        <#
        var title = settings.title;
        #>
        <div class="aydenpate-option-widget">
            <h3>{{{ title }}}</h3>
            <div id="pasta-options"></div>
            <div id="sauce-options"></div>
            <div id="cheese-options"></div>
            <div id="dessert-options"></div>
            <div id="drink-options"></div>
        </div>
        <?php
    }
}

Plugin::instance()->widgets_manager->register_widget_type(new AydenPate_Option_Widget());
?>
