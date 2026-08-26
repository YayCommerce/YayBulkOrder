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
        $settings = array_replace_recursive( $this->get_default_settings(), $settings );
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
        $settings = $this->get_settings();
        $design   = $settings['design'];

        return [
            '--ybo-primary-color'                 => $design['primaryColor'],
            '--ybo-text-color'                    => $design['textColor'],
            '--ybo-text-hover-color'              => $design['textHoverColor'],
            '--ybo-description-color'             => $design['descriptionColor'],
            '--ybo-border-color'                  => $design['borderColor'],
            '--ybo-background-color'              => $design['backgroundColor'],
            '--ybo-button-background-color'       => $design['buttonBackgroundColor'],
            '--ybo-button-background-hover-color' => $design['buttonBackgroundHoverColor'],
            '--ybo-button-text-color'             => $design['buttonTextColor'],
            '--ybo-button-text-hover-color'       => $design['buttonTextHoverColor'],

            'color'                               => 'var(--ybo-text-color)',
            'background-color'                    => 'var(--ybo-background-color)',
            'border-color'                        => 'var(--ybo-border-color)',
        ];
    }

    private function get_default_settings() {
        return [
            'general'      => [
                'defaultCartQuantity' => 5,
                'defaultPageSize'     => 5,
            ],
            'design'       => [
                'primaryColor'               => '#3858e9',
                'textColor'                  => '#171719',
                'textHoverColor'             => '#3858e9',
                'descriptionColor'           => '#7b7c80',
                'borderColor'                => '#e4e4e7',
                'backgroundColor'            => '#ffffff',
                'buttonBackgroundColor'      => '#3858e9',
                'buttonBackgroundHoverColor' => '#2d47ba',
                'buttonTextColor'            => '#ffffff',
                'buttonTextHoverColor'       => '#ffffff',
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
        ];
    }
}
