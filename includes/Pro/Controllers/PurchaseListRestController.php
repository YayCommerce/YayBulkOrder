<?php
namespace YayBulkOrder\Pro\Controllers;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Controllers\BaseRestController;
use YayBulkOrder\Pro\Services\PurchaseListService;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Purchase Lists API endpoints.
 */
class PurchaseListRestController extends BaseRestController {
    use SingletonTrait;

    private PurchaseListService $purchase_list_service;

    protected function __construct() {
        $this->purchase_list_service = PurchaseListService::get_instance();
        $this->init_hooks();
    }

    protected function init_hooks() {
        register_rest_route(
            self::REST_NAMESPACE,
            '/purchase-list',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'insert_purchase_list' ],
                    'permission_callback' => [ $this, 'can_manage_purchase_list' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/purchase-list/(?P<list_id>\d+)',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update_purchase_list' ],
                    'permission_callback' => [ $this, 'can_manage_purchase_list' ],
                ],
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'delete_purchase_list' ],
                    'permission_callback' => [ $this, 'can_manage_purchase_list' ],
                ],
            ]
        );
    }

    // Handler callbacks
    public function insert_purchase_list( \WP_REST_Request $request ) {
        $list_name = $request->get_param( 'name' );
        $products  = $request->get_param( 'products' );
        $user_id   = get_current_user_id();

        if ( empty( $user_id ) || empty( $list_name ) || empty( $products ) ) {
            return $this->error_invalid_arguments();
        }

        $result = $this->purchase_list_service->insert_purchase_list( $user_id, $list_name, $products );

        if ( is_wp_error( $result ) ) {
            return new \WP_Error( 'internal_error', __( 'An Unexpected error occured', 'yay-bulk-order' ), [ 'status' => 500 ] );
        }

        return $this->purchase_list_service->get_purchase_list( $result, $user_id );
    }

    public function update_purchase_list( \WP_REST_Request $request ) {
        $list_id   = (int) $request->get_param( 'list_id' );
        $list_name = $request->get_param( 'name' );
        $products  = $request->get_param( 'products' );
        $user_id   = get_current_user_id();

        if ( empty( $list_id ) || empty( $user_id ) || empty( $list_name ) || empty( $products ) ) {
            return false;
        }

        $purchase_list = $this->purchase_list_service->get_purchase_list( $list_id, $user_id );
        if ( empty( $purchase_list ) ) {
            return $this->error_invalid_arguments( __( 'This purchase list is not found or not belong to the current user', 'yay-bulk-order' ) );
        }

        $this->purchase_list_service->update_purchase_list( $list_id, $list_name, $products );

        return $this->purchase_list_service->get_purchase_list( $list_id, $user_id );
    }

    public function delete_purchase_list( \WP_REST_Request $request ) {
        $list_id = (int) $request->get_param( 'list_id' );
        $user_id = get_current_user_id();

        $purchase_list = $this->purchase_list_service->get_purchase_list( $list_id, $user_id );
        if ( empty( $purchase_list ) ) {
            return $this->error_invalid_arguments( __( 'This purchase list is not found or not belong to the current user', 'yay-bulk-order' ) );
        }

        $result = wp_delete_post( $list_id );
        if ( empty( $result ) ) {
            return false;
        }

        return true;
    }

    // Permission callbacks
    public function can_manage_purchase_list() {
        if ( is_user_logged_in() ) {
            return true;
        }

        return $this->error_unauthorized();
    }
}
