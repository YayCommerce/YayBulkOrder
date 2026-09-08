<?php
namespace YayBulkOrder\Pro\Engines;

use YayBulkOrder\Pro\Controllers\ProductTablesRestController;
use YayBulkOrder\Pro\Controllers\PurchaseListRestController;
use YayBulkOrder\Utils\SingletonTrait;


defined( 'ABSPATH' ) || exit;

/**
 * Class RestAPI
 *
 * Handles Yay Bulk Order REST API endpoints.
 */
class RestAPI {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'rest_api_init', [ $this, 'bulk_order_endpoints' ] );
    }

    public function bulk_order_endpoints() {
        PurchaseListRestController::get_instance();
        ProductTablesRestController::get_instance();
    }
}
