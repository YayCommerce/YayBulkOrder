<?php
namespace YayBulkOrder\Controllers;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Services\SettingsService;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Settings API endpoints.
 */
class SettingsRestController extends BaseRestController {
    use SingletonTrait;

    private SettingsService $settings_service;

    protected function __construct() {
        $this->settings_service = SettingsService::get_instance();
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/settings',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_settings' ],
                    'permission_callback' => [ $this, 'can_manage_settings' ],
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'save_settings' ],
                    'permission_callback' => [ $this, 'can_manage_settings' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/mark-reviewed',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'mark_reviewed' ],
                    'permission_callback' => [ $this, 'can_manage_settings' ],
                ],
            ]
        );
    }

    public function get_settings() {
        $settings = $this->settings_service->get_settings();
        return $settings;
    }

    public function save_settings( WP_REST_Request $request ) {
        $payload = $request->get_json_params();

        if ( empty( $payload ) ) {
            return $this->error_invalid_arguments();
        }

        $this->settings_service->save_settings( $payload );
        $updated_settings = $this->settings_service->get_settings();

        return $updated_settings;
    }

    public function mark_reviewed() {
        update_option( 'yaybulkorder_reviewed', true );
        return true;
    }

    public function can_manage_settings() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return $this->error_forbidden();
        }

        return true;
    }
}
