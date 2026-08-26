<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Controllers\BaseRestController;

defined( 'ABSPATH' ) || exit;

/**
 * Load data to localize to window
 *
 * @method static LocalizeService get_instance()
 */
class LocalizeService {
    use SingletonTrait;

    public const VAR_ADMIN_DATA = 'yayBulkOrderAdminData';
    public const VAR_META       = 'yayBulkOrderMeta';

    private SettingsService $settings_service;

    protected function __construct() {
        $this->settings_service = SettingsService::get_instance();
    }

    public function get_admin_data() {
        return [
            'settings' => $this->settings_service->get_settings(),
            'general'  => [
                'currency'            => [
                    'symbol'      => html_entity_decode( get_woocommerce_currency_symbol() ),
                    'position'    => get_option( 'woocommerce_currency_pos' ),
                    'decimals'    => wc_get_price_decimals(),
                    'decimalSep'  => wc_get_price_decimal_separator(),
                    'thousandSep' => wc_get_price_thousand_separator(),
                ],
                'defaultCartQuantity' => 5,
                'defaultPageSize'     => 10,
            ],
        ];
    }

    public function get_meta() {
        $meta = [
            'wpMeta'        => [
                'siteUrl'      => esc_url_raw( site_url() ),
                'adminUrl'     => esc_url_raw( admin_url() ),
                'ajaxUrl'      => esc_url_raw( admin_url( 'admin-ajax.php' ) ),

                'restRoot'     => esc_url_raw( rest_url() ),
                'restBase'     => BaseRestController::REST_NAMESPACE,
                'restNonce'    => wp_create_nonce( 'wp_rest' ),

                'isBlockTheme' => wp_is_block_theme(),
                'shopPageId'   => function_exists( 'wc_get_page_id' ) ? (int) wc_get_page_id( 'shop' ) : 0,
            ],
            'bulkOrderMeta' => [
                'pluginUrl' => YAYBULKORDER_PLUGIN_URL,
                'assetsUrl' => YAYBULKORDER_PLUGIN_URL . 'assets',

                'version'   => YAYBULKORDER_VERSION,
                'reviewed'  => get_option( 'yaybulkorder_reviewed', false ),
            ],
        ];

        return $meta;
    }

    public function get_global_config() {
        $admin_data = $this->get_admin_data();
        $meta       = $this->get_meta();

        return [
            'settings'      => [
                'colors'  => $admin_data['settings']['design'],
                'general' => $admin_data['general'],
            ],
            'wpMeta'        => $meta['wpMeta'],
            'bulkOrderMeta' => $meta['bulkOrderMeta'],
        ];
    }
}
