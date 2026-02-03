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

    public function save_settings( $settings ) {
        $settings = array_replace_recursive( $this->get_default_settings(), $settings );
        return update_option( 'yay_bulk_order_settings', $settings );
    }

    public function get_config() {
        return [
            'metadata' => [
                'isBlockTheme' => wp_is_block_theme(),
            ],
            'path'     => [
                'assetsUrl' => YAY_BULK_ORDER_PLUGIN_URL . 'assets/',
                'restUrl'   => rest_url( 'yay-bulk-order/v1' ),
                'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                'nonce'     => wp_create_nonce( 'wp_rest' ),
            ],
            'settings' => $this->get_settings(),
        ];
    }

    private function get_default_settings() {
        return [
            'general' => [
                'defaultCartQuantity' => 10,
                'pageSize'            => 5,
            ],
            'styles'  => [
                'colors'       => [
                    'primary'             => '#2271b1',
                    'textNormal'          => '#333333',
                    'backgroundNormal'    => '#ffffff',
                    'textSecondary'       => '#777777',
                    'backgroundSecondary' => '#f3f3f3',
                    'borderColor'         => '#e4e4e7',
                ],
                'borderRadius' => 'normal',
            ],
        ];
    }
}
