<?php
namespace YayBulkOrder\Controllers;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Services\SettingsService;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Settings API endpoints.
 */
class SettingsController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            $this->namespace,
            '/settings',
            [
               
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'save_settings' ],
                    'permission_callback' => [ $this, 'settings_permission_callback' ],
                ],
            ]
        );

    }

    /**
     * Check if the user has the necessary permissions to access the settings endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function settings_permission_callback() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale' ), [ 'status' => 401 ] );
        }

        return true;
    }
    
    /**
     * Save the settings.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function save_settings( WP_REST_Request $request ): WP_REST_Response {
        $params = $this->get_json_params( $request );

        if ( empty( $params ) ) {
            return $this->error( __( 'Invalid settings data', 'yay-bulk-order' ) );
        }

        SettingsService::get_instance()->save_settings( $params );

        return $this->success( [], __( 'Settings saved!', 'yay-bulk-order' ) );
    }

    
}
