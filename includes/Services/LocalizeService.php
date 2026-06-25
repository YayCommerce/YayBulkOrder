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
}
