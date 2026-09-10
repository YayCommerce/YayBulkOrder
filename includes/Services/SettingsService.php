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
        return $this->strip_legacy_currency( array_replace_recursive( $this->get_default_settings(), $settings ) );
    }

    public function save_settings( array $settings ) {
        $settings = $this->strip_legacy_currency( array_replace_recursive( $this->get_default_settings(), $settings ) );
        return update_option( 'yay_bulk_order_settings', $settings );
    }

    /**
     * Currency used to be persisted under `general.currency`, which baked a stale
     * value into the saved option on every save. It now lives in LocalizeService::get_global_config()
     * so it always reflects the live WooCommerce settings. Strip any leftover key
     * from options saved before this change.
     */
    private function strip_legacy_currency( array $settings ) {
        unset( $settings['general']['currency'] );
        return $settings;
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
        $colors   = $settings['colors'];

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
