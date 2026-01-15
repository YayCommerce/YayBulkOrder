<?php
namespace YayBulkOrder\Controllers;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Services\ShortcodesService;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Shortcodes API endpoints.
 */
class ShortcodesController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            $this->namespace,
            '/shortcodes',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_shortcodes' ],
                    'permission_callback' => [ $this, 'shortcodes_permission_callback' ],
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'save_shortcode' ],
                    'permission_callback' => [ $this, 'shortcodes_permission_callback' ],
                ],
            ]
        );

    }

    /**
     * Check if the user has the necessary permissions to access the settings endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function shortcodes_permission_callback() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale' ), [ 'status' => 401 ] );
        }

        return true;
    }

    /**
     * Get the shortcodes.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_shortcodes( WP_REST_Request $request ): WP_REST_Response {
        $page     = $request['page'];
        $per_page = $request['per_page'];
        $keyword  = $request['keyword'];
        

        if ( ! isset( $page ) ) {
            $page = 1;
        }

        if ( ! isset( $per_page ) ) {
            $per_page = 10;
        }

        if ( ! isset( $keyword ) ) {
            $keyword = '';
        }

       

        $response = ShortcodesService::get_instance()->get_paginated_shortcode( $keyword, $page, $per_page );

        return $this->success( $response, __( 'Shortcodes fetched!', 'yay-bulk-order' ) );
    }
    
    /**
     * Save the shortcode.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function save_shortcode( WP_REST_Request $request ): WP_REST_Response {
        $params = $this->get_json_params( $request );

        if ( empty( $params ) ) {
            return $this->error( __( 'Invalid shortcode data', 'yay-bulk-order' ) );
        }


        return $this->success( [], __( 'Shortcode saved!', 'yay-bulk-order' ) );
    }

    
}
