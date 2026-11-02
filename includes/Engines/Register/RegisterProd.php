<?php
namespace YayBulkOrder\Engines\Register;

use YayBulkOrder\Engines\Register\ScriptName;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/** Register in Production Mode */
class RegisterProd {
    use SingletonTrait;

    /** Hooks Initialization */
    private function __construct() {
        add_action( 'init', [ $this, 'register_all_scripts' ] );
    }

    public function register_all_scripts() {
        wp_register_script( ScriptName::ADMIN_PAGE, YAYBULKORDER_PLUGIN_URL . 'assets/dist/page-admin/js/app-admin.main.js', ScriptName::ADMIN_PAGE_DEPS, YAYBULKORDER_VERSION, true );
        wp_set_script_translations( ScriptName::ADMIN_PAGE, 'yay-bulk-order', YAYBULKORDER_PLUGIN_PATH . 'languages' );
    }
}
