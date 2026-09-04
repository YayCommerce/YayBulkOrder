<?php
namespace YayBulkOrder;

use YayBulkOrder\YayBulkOrderLicenseAdapter;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * YayBulkOrder Plugin Initializer
 */
class YayBulkOrder {

    use SingletonTrait;

    protected function __construct() {
        \YayBulkOrder\Engines\Register\RegisterFacade::get_instance();
        \YayBulkOrder\Engines\Blocks\RegisterBlocks::get_instance();
        \YayBulkOrder\Engines\Shortcodes\ProductTableShortcode::get_instance();
        \YayBulkOrder\Engines\Admin\AdminPage::get_instance();
        \YayBulkOrder\Engines\RestAPI::get_instance();

        \YayBulkOrder\Engines\Blocks\Patterns\PatternRegistry::get_instance();
        \YayBulkOrder\Engines\Compatibles\Compatibles::get_instance();

        if ( self::is_pro() ) {
            \YayBulkOrder\Pro\YayBulkOrderPro::initialize();
        } else {
            $this->register_admin_menu();
        }

        add_action( 'before_woocommerce_init', [ $this, 'before_woocommerce_init' ] );
    }

    public static function initialize() {
        self::get_instance();
    }

    public static function is_pro(): bool {
        return class_exists( 'YayBulkOrder\Pro\YayBulkOrderPro', true );
    }

    public function before_woocommerce_init() {
        if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', YAYBULKORDER_FILE, true );
        }
    }

    private function register_admin_menu() {
        \YayBulkOrderScoped\YayCommerce\AdminShell\AdminShell::boot();
        \YayBulkOrderScoped\YayCommerce\AdminShell\AdminShell::register_plugin(
            new YayBulkOrderLicenseAdapter()
        );
    }
}
