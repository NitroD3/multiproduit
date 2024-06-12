<?php
namespace Elementor;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class AydenPate_Option_Widget extends Widget_Base {
    public function get_name() {
        return 'aydenpate_option_widget';
    }

    public function get_title() {
        return __('AydenPate Option', 'aydenpate');
    }

    public function get_icon() {
        return 'eicon-accordion';
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
            'content',
            [
                'label' => __('Content', 'aydenpate'),
                'type' => \Elementor\Controls_Manager::WYSIWYG,
                'default' => __('Default content', 'aydenpate'),
                'placeholder' => __('Type your content here', 'aydenpate'),
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        echo '<div class="aydenpate-option-widget">' . $settings['content'] . '</div>';
    }

    protected function _content_template() {
        ?>
        <div class="aydenpate-option-widget">
            {{{ settings.content }}}
        </div>
        <?php
    }
}
