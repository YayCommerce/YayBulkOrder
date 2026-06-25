<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Controllers\BaseRestController;

defined( 'ABSPATH' ) || exit;

/**
 * Load and save settings
 *
 * @method static LocalizeService get_instance()
 */
class LocalizeService {
    use SingletonTrait;

    public const VAR_ADMIN_DATA = 'yayBulkOrderAdminData';
    public const VAR_META       = 'yayBulkOrderMeta';

    public function get_admin_data() {
        return [
            'init_settings' => 'TODO',
        ];
    }

    public function get_meta() {
        $meta = [
            'wpMeta'        => [
                'siteUrl'   => esc_url_raw( site_url() ),
                'adminUrl'  => esc_url_raw( admin_url() ),
                'ajaxUrl'   => esc_url_raw( admin_url( 'admin-ajax.php' ) ),

                'restRoot'  => esc_url_raw( rest_url() ),
                'restBase'  => BaseRestController::REST_NAMESPACE,
                'restNonce' => wp_create_nonce( 'wp_rest' ),
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
