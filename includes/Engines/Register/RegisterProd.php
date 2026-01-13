<?php
namespace YayBulkOrder\Engines\Register;

use YayBulkOrder\Engines\Register\ScriptName;
use YayBulkOrder\Utils\SingletonTrait;

/** Register in Production Mode */
class RegisterProd {
    use SingletonTrait;

    /** Hooks Initialization */
    private function __construct() {
        add_action( 'init', [ $this, 'register_all_scripts' ] );
    }

    public function register_all_scripts() {
        $deps = [ 'react', 'react-dom', 'wp-hooks', 'wp-i18n', ScriptName::UTILS_SCRIPT ];

        wp_register_script( ScriptName::ADMIN_PAGE, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/admin-page/admin-page.js', $deps, YAY_BULK_ORDER_VERSION, true );
        wp_set_script_translations( ScriptName::ADMIN_PAGE, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );

        $utils_asset = require_once YAY_BULK_ORDER_PLUGIN_PATH . 'assets/dist/utils/utils.entry.ts.asset.php';
        wp_register_script( ScriptName::UTILS_SCRIPT, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/utils/utils.entry.ts.js', $utils_asset['dependencies'], $utils_asset['version'], true );
        wp_set_script_translations( ScriptName::UTILS_SCRIPT, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );

        $view_asset = require_once YAY_BULK_ORDER_PLUGIN_PATH . 'assets/dist/view/bulk-order-view.asset.php';
        wp_register_script_module( ScriptName::VIEW_MODULE, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/view/bulk-order-view.js', $view_asset['dependencies'], $view_asset['version'], true );
        wp_set_script_translations( ScriptName::VIEW_MODULE, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );
    }
}
