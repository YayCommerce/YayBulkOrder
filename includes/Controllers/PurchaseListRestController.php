<?php
namespace YayBulkOrder\Controllers;

use YayBulkOrder\Utils\SingletonTrait;
use WP_REST_Request;
use YayBulkOrder\Services\PurchaseListService;

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
    public function insert_purchase_list() {
    }

    // Permission callbacks
    public function can_manage_purchase_list() {
        if ( is_user_logged_in() ) {
            return true;
        }

        return $this->error_forbidden();
    }
}
