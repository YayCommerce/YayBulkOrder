<?php
namespace YayBulkOrder\Pro;

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
