<?php
namespace YayBulkOrder\Engines;

use YayBulkOrder\Controllers\SettingsController;
use YayBulkOrder\Controllers\ShortcodesController;
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
        SettingsController::get_instance();
        ShortcodesController::get_instance();
    }
}
