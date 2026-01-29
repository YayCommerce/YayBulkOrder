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
class ShortcodesRestController extends BaseRestController {
    use SingletonTrait;

    private $shortcodes_service;

    protected function __construct() {
        $this->shortcodes_service = ShortcodesService::get_instance();
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
        
        register_rest_route(
            $this->namespace,
            '/shortcodes/bulk-delete',
            [
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'bulk_delete_shortcodes' ],
                    'permission_callback' => [ $this, 'shortcodes_permission_callback' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/shortcodes/(?P<id>\d+)',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_shortcode' ],
                    'permission_callback' => [ $this, 'shortcodes_permission_callback' ],
                ],
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update_shortcode' ],
                    'permission_callback' => [ $this, 'shortcodes_permission_callback' ],
                ],
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'delete_shortcode' ],
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
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-bulk-order' ), [ 'status' => 401 ] );
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
        
        $page     = max( 1, (int) ( $request->get_param( 'page' ) ?? 1 ) );
        $per_page = (int) ( $request->get_param( 'per_page' ) ?? ShortcodesService::SHORTCODE_PER_PAGE );
        $keyword  = $request->get_param( 'keyword' );
        
        $response = $this->shortcodes_service->get_paginated_shortcode( $keyword, $page, $per_page );

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

        try {
            $post_id = $this->shortcodes_service->create_shortcode( $params );
            return $this->success( [ ...$params, 'id' => $post_id ], __( 'Shortcode saved!', 'yay-bulk-order' ) );
        } catch ( \Exception $e ) {
            return $this->error( $e->getMessage(), 400 );
        }
    }

    /**
     * Get the shortcode.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_shortcode( WP_REST_Request $request ): WP_REST_Response {
        $id = $request['id'];
        $response = $this->shortcodes_service->get_shortcode( $id );
        return $this->success( $response, __( 'Shortcode fetched!', 'yay-bulk-order' ), 200 );
    }

    /**
     * Update the shortcode.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function update_shortcode( WP_REST_Request $request ): WP_REST_Response {
        if(!$request->has_param('title') || !$request->has_param('id')) {
            return $this->error( __( 'Title and ID are required', 'yay-bulk-order' ), 400 );
        }
        
        $id = $request->get_param('id');
        $params = $this->get_json_params( $request );
        
        try {
            $response = $this->shortcodes_service->update_shortcode( $id, $params );
            return $this->success( $response, __( 'Shortcode updated!', 'yay-bulk-order' ), 200 );
        } catch ( \Exception $e ) {
            return $this->error( $e->getMessage(), 400 );
        }
    }

    /**
     * Delete the shortcode.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function delete_shortcode( WP_REST_Request $request ): WP_REST_Response {
        $id = $request->get_param('id');
        $result = $this->shortcodes_service->delete_shortcode( $id );
        if ( ! $result ) {
            return $this->error( __( 'Failed to delete shortcode!', 'yay-bulk-order' ) );
        }
        return $this->success( [], __( 'Shortcode deleted!', 'yay-bulk-order' ) );
    }

    /**
     * Bulk delete multiple shortcodes.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */

    public function bulk_delete_shortcodes( WP_REST_Request $request ): WP_REST_Response {
        $params  = $this->get_json_params( $request );
        $ids     = $params['ids'] ?? [];
        $deleted = 0;
        $failed  = 0;

        foreach ( $ids as $id ) {
            $result = $this->shortcodes_service->delete_shortcode( $id );
            if ( $result ) {
                ++$deleted;
            } else {
                ++$failed;
            }
        }

        if ( count( $ids ) === $failed ) {
            return $this->error( __( 'Can not delete these shortcodes', 'yay-bulk-order' ) );
        }

        if ( count( $ids ) === $deleted ) {
            return $this->success( [], __( 'Shortcodes have been deleted successfully', 'yay-bulk-order' ) );
        }

        // Translators: 1: number of shortcodes successfully deleted; 2: number of shortcodes that failed.
        $message = __( '%1$d shortcode(s) deleted, %2$d shortcode(s) failed', 'yay-bulk-order' );
        $message = sprintf( $message, $deleted, $failed );

        return $this->success( [], $message );
    }
}
