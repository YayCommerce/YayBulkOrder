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
        $deps = [ 'react', 'react-dom', 'wp-hooks', 'wp-i18n' ];

        wp_register_script( ScriptName::ADMIN_PAGE, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/admin-page.js', $deps, YAY_BULK_ORDER_VERSION, true );
        wp_set_script_translations( ScriptName::ADMIN_PAGE, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );
    }
}
