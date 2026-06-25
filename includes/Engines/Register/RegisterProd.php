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

        wp_register_script( ScriptName::ADMIN_PAGE, YAYBULKORDER_PLUGIN_URL . 'assets/dist/app-admin/app-admin.js', $deps, YAYBULKORDER_VERSION, true );
        wp_set_script_translations( ScriptName::ADMIN_PAGE, 'yay-bulk-order', YAYBULKORDER_PLUGIN_PATH . 'languages' );
    }
}
