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
        $settings = get_option( 'yaybulkorder_settings', [] );
        return array_replace_recursive( $this->get_default_settings(), $settings );
    }

    public function save_settings( array $settings ) {
        $settings = array_replace_recursive( $this->get_default_settings(), $settings );
        return update_option( 'yaybulkorder_settings', $settings );
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
            '--ybod-primary-color'                 => $colors['primary'],
            '--ybod-text-color'                    => $colors['text'],
            '--ybod-text-hover-color'              => $colors['textHover'],
            '--ybod-description-color'             => $colors['description'],
            '--ybod-border-color'                  => $colors['border'],
            '--ybod-background-color'              => $colors['background'],
            '--ybod-button-background-color'       => $colors['buttonBackground'],
            '--ybod-button-background-hover-color' => $colors['buttonBackgroundHover'],
            '--ybod-button-text-color'             => $colors['buttonText'],
            '--ybod-button-text-hover-color'       => $colors['buttonTextHover'],
            '--ybod-header-text-color'             => $colors['headerText'],
            '--ybod-header-background-color'       => $colors['headerBackground'],

            '--ybod-text-default-color'            => $default_colors['text'],
            '--ybod-text-hover-default-color'      => $default_colors['textHover'],
            '--ybod-description-default-color'     => $default_colors['description'],
            '--ybod-border-default-color'          => $default_colors['border'],
            '--ybod-background-default-color'      => $default_colors['background'],

            'color'                               => 'var(--ybod-text-color)',
            'border-color'                        => 'var(--ybod-border-color)',
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
                'headerBackground'      => '#ffffff',
                'headerText'            => '#171719',
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
