<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Load and save settings
 *
 * @method static SettingsService get_instance()
 */
class SettingsService {
    use SingletonTrait;

    public function get_settings() {
        $settings = get_option( 'yay_bulk_order_settings', [] );
        return array_replace_recursive( $this->get_default_settings(), $settings );
    }

    public function save_settings( array $settings ) {
        // Merge onto the currently stored settings (which already fills any
        // gaps from defaults via get_settings()), not onto the bare
        // defaults — otherwise a partial payload (e.g. only `general`)
        // silently resets every other group (`csvOrder`, `purchaseList`,
        // `colors`, ...) back to its default value.
        $settings = array_replace_recursive( $this->get_settings(), $settings );
        return update_option( 'yay_bulk_order_settings', $settings );
    }

    public function get_config() {
        return [
            'metadata' => [
                'isBlockTheme' => wp_is_block_theme(),
            ],
            'path'     => [
                'assetsUrl' => YAYBULKORDER_PLUGIN_URL . 'assets/',
                'restUrl'   => rest_url( 'yay-bulk-order/v1' ),
                'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                'nonce'     => wp_create_nonce( 'wp_rest' ),
            ],
            'settings' => $this->get_settings(),
        ];
    }

    public function get_styles() {
        $settings       = $this->get_settings();
        $default_colors = $this->get_default_color_preset();
        $colors         = $settings['colors'];

        return [
            '--ybo-primary-color'                 => $colors['primary'],
            '--ybo-text-color'                    => $colors['text'],
            '--ybo-text-hover-color'              => $colors['textHover'],
            '--ybo-description-color'             => $colors['description'],
            '--ybo-border-color'                  => $colors['border'],
            '--ybo-background-color'              => $colors['background'],
            '--ybo-button-background-color'       => $colors['buttonBackground'],
            '--ybo-button-background-hover-color' => $colors['buttonBackgroundHover'],
            '--ybo-button-text-color'             => $colors['buttonText'],
            '--ybo-button-text-hover-color'       => $colors['buttonTextHover'],

            '--ybo-text-default-color'            => $default_colors['text'],
            '--ybo-text-hover-default-color'      => $default_colors['textHover'],
            '--ybo-description-default-color'     => $default_colors['description'],
            '--ybo-border-default-color'          => $default_colors['border'],
            '--ybo-background-default-color'      => $default_colors['background'],

            'color'                               => 'var(--ybo-text-color)',
            'border-color'                        => 'var(--ybo-border-color)',
        ];
    }

    private function get_default_settings() {
        return [
            'general'      => [
                'defaultCartQuantity' => 5,
                'defaultPageSize'     => 5,
            ],
            'colors'       => [
                'primary'               => '#3858e9',
                'text'                  => '#171719',
                'textHover'             => '#3858e9',
                'description'           => '#7b7c80',
                'border'                => '#e4e4e7',
                'background'            => '#ffffff',
                'buttonBackground'      => '#3858e9',
                'buttonBackgroundHover' => '#2d47ba',
                'buttonText'            => '#ffffff',
                'buttonTextHover'       => '#ffffff',
            ],
            'purchaseList' => [
                'isAddToAccountPage'     => true,
                'savePurchaseListButton' => [
                    'isAddToCartPage'     => true,
                    'isAddToCheckoutPage' => true,
                    'isAddToMiniCart'     => false,
                    'isAddToOrder'        => false,
                ],
            ],
            'csvOrder'     => [
                'isAddToAccountPage' => false,
            ],
            'borderRadius' => '8px',
        ];
    }

    public function get_default_color_preset() {
        return $this->get_default_settings()['colors'];
    }
}
