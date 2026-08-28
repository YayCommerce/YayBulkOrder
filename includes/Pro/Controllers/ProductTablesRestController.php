<?php
namespace YayBulkOrder\Pro\Controllers;

use YayBulkOrder\Controllers\BaseRestController;
use YayBulkOrder\Pro\Services\ProductTablesService;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Product Table Rest Controller
 */
class ProductTablesRestController extends BaseRestController {
    use SingletonTrait;

    private ProductTablesService $product_tables_service;

    protected function __construct() {
        $this->product_tables_service = ProductTablesService::get_instance();
        $this->init_hooks();
    }

    protected function init_hooks() {
        register_rest_route(
            self::REST_NAMESPACE,
            '/table-prebuilds',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'index' ],
                    'permission_callback' => [ $this, 'can_manage' ],
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'create_product_table' ],
                    'permission_callback' => [ $this, 'can_manage' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/table-prebuilds/(?P<id>\d+)',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'show' ],
                    'permission_callback' => [ $this, 'can_manage' ],
                ],
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update' ],
                    'permission_callback' => [ $this, 'can_manage' ],
                ],
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'destroy' ],
                    'permission_callback' => [ $this, 'can_manage' ],
                ],
            ]
        );
    }

    public function index( \WP_REST_Request $request ) {
        $page             = intval( $request->get_param( 'page' ) ?? 1 );
        $per_page         = intval( $request->get_param( 'per_page' ) ?? 10 );
        $search           = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
        $products_display = sanitize_text_field( $request->get_param( 'products_display' ) ?? 'all-type' );
        return $this->product_tables_service->get_paginated_product_tables( $search, $page, $per_page, $products_display );
    }

    public function show( \WP_REST_Request $request ) {
        $id       = (int) $request['id'];
        $prebuild = $this->product_tables_service->get_product_table_by_id( $id );

        if ( empty( $prebuild ) ) {
            return $this->error_invalid_arguments();
        }

        return $prebuild;
    }

    public function create_product_table( \WP_REST_Request $request ) {
        $data = $request->get_json_params();
        if ( empty( $data ) || ! is_array( $data ) ) {
            return $this->error_invalid_arguments();
        }

        $prebuild = $this->product_tables_service->create_product_table( $data );

        if ( ! $prebuild ) {
            return $this->error_invalid_arguments( __( 'Could not create the prebuilt table.', 'yay-bulk-order' ) );
        }

        return $prebuild;
    }

    public function update( \WP_REST_Request $request ) {
        $data = $request->get_json_params();
        if ( empty( $data ) || ! is_array( $data ) ) {
            return $this->error_invalid_arguments();
        }

        $id       = (int) $request['id'];
        $prebuild = $this->product_tables_service->get_product_table_by_id( $id );

        if ( empty( $prebuild ) ) {
            return $this->error_invalid_arguments();
        }

        $prebuild = $this->product_tables_service->update_product_table( $id, $data );

        return $prebuild;
    }

    public function destroy( \WP_REST_Request $request ) {
        $id       = (int) $request['id'];
        $prebuild = $this->product_tables_service->get_product_table_by_id( $id );

        if ( empty( $prebuild ) ) {
            return $this->error_invalid_arguments();
        }

        $deleted = $this->product_tables_service->delete_product_table( $id );

        return $deleted;
    }

    public function can_manage() {
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        return $this->error_forbidden();
    }
}
