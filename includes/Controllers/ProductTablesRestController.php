<?php
namespace YayBulkOrder\Controllers;

use YayBulkOrder\Controllers\BaseRestController;
use YayBulkOrder\Services\ProductTablesService;
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
            '/product-tables',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_product_tables_list' ],
                    'permission_callback' => [ $this, 'can_manage_product_tables' ],
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'create_product_table' ],
                    'permission_callback' => [ $this, 'can_manage_product_tables' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/product-tables/bulk-delete',
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'bulk_delete_product_table' ],
                'permission_callback' => [ $this, 'can_manage_product_tables' ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/product-tables/(?P<id>\d+)',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_table_list' ],
                    'permission_callback' => [ $this, 'can_manage_product_tables' ],
                ],
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update_product_table' ],
                    'permission_callback' => [ $this, 'can_manage_product_tables' ],
                ],
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'delete_product_table' ],
                    'permission_callback' => [ $this, 'can_manage_product_tables' ],
                ],
            ]
        );
    }

    public function get_product_tables_list( \WP_REST_Request $request ) {
        $page             = intval( $request->get_param( 'page' ) ?? 1 );
        $per_page         = intval( $request->get_param( 'perPage' ) ?? 10 );
        $search           = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
        $products_display = sanitize_text_field( $request->get_param( 'productsDisplay' ) ?? 'all-tables' );
        return $this->product_tables_service->get_paginated_product_tables( $search, $page, $per_page, $products_display );
    }

    public function get_table_list( \WP_REST_Request $request ) {
        $id            = (int) $request['id'];
        $product_table = $this->product_tables_service->get_product_table_by_id( $id );

        if ( empty( $product_table ) ) {
            return $this->error_invalid_arguments();
        }

        return $product_table;
    }

    public function create_product_table( \WP_REST_Request $request ) {
        $data = $request->get_json_params();
        if ( empty( $data ) || ! is_array( $data ) ) {
            return $this->error_invalid_arguments();
        }

        $product_table = $this->product_tables_service->create_product_table( $data );

        if ( ! $product_table ) {
            return $this->error_invalid_arguments( __( 'Could not create the prebuilt table.', 'yay-bulk-order' ) );
        }

        return $product_table;
    }

    public function update_product_table( \WP_REST_Request $request ) {
        $data = $request->get_json_params();
        if ( empty( $data ) || ! is_array( $data ) ) {
            return $this->error_invalid_arguments();
        }

        $id            = (int) $request['id'];
        $product_table = $this->product_tables_service->get_product_table_by_id( $id );

        if ( empty( $product_table ) ) {
            return $this->error_invalid_arguments();
        }

        $product_table = $this->product_tables_service->update_product_table( $id, $data );

        return $product_table;
    }

    public function delete_product_table( \WP_REST_Request $request ) {
        $id            = (int) $request['id'];
        $product_table = $this->product_tables_service->get_product_table_by_id( $id );

        if ( empty( $product_table ) ) {
            return $this->error_invalid_arguments();
        }

        $deleted = $this->product_tables_service->delete_product_table( $id );

        return $deleted;
    }

    public function bulk_delete_product_table( \WP_REST_Request $request ) {
        $payload   = $request->get_json_params();
        $table_ids = $payload['tableIds'] ?? [];

        if ( empty( $table_ids ) ) {
            return $this->error_invalid_arguments();
        }

        $deleted_count = 0;
        foreach ( $table_ids as $id ) {
            $result = $this->product_tables_service->delete_product_table( $id );
            if ( $result === true ) {
                ++$deleted_count;
            }
        }

        return $deleted_count;
    }

    public function can_manage_product_tables() {
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        return $this->error_forbidden();
    }
}
