<?php
namespace YayBulkOrder\Pro;

use YayBulkOrder\Pro\Engines\Blocks\CSVOrder;
use YayBulkOrder\Pro\Engines\Frontend\Frontend;
use YayBulkOrder\Pro\Engines\Blocks\PurchaseList;
use YayBulkOrder\Pro\Engines\Blocks\RegisterBlocks;
use YayBulkOrder\Pro\Engines\RestAPI;
use YayBulkOrder\YayBulkOrderLicenseAdapter;
use YayBulkOrder\Pro\YayBulkOrderProLicenseAdapter;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Pro Features Initalize
 */
class YayBulkOrderPro {
    use SingletonTrait;

    protected function __construct() {
        // TODO: EDD setup
        // if ( ! YayBulkOrderProLicenseAdapter::is_licensed() ) {
        // return;
        // }

        // Pro Engine here
        PurchaseList::get_instance();
        CSVOrder::get_instance();
        Frontend::get_instance();

        RestAPI::get_instance();

        RegisterBlocks::get_instance();

        $this->register_admin_menu();
    }

    public static function initialize() {
        self::get_instance();
    }

    private function register_admin_menu() {
        \YayBulkOrderScoped\YayCommerce\AdminShell\AdminShell::boot();
        \YayBulkOrderScoped\YayCommerce\AdminShell\AdminShell::register_plugin(
            new YayBulkOrderLicenseAdapter()
            // new YayBulkOrderProLicenseAdapter()
        );
    }
}
