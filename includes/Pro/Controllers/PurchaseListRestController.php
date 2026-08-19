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
    }

    // Handler callbacks
    public function insert_purchase_list( \WP_REST_Request $request ) {
        $list_name = $request->get_param( 'name' );
        $products  = $request->get_param( 'products' );
        $user_id   = get_current_user_id();

        if ( empty( $user_id ) || empty( $list_name ) || empty( $products ) ) {
            return false;
        }

        $result = $this->purchase_list_service->insert_purchase_list( $user_id, $list_name, $products );

        if ( is_wp_error( $result ) ) {
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
