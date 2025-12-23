<?php
namespace YayBulkOrder\Engines\Registries;

use YayBulkOrder\Engines\Registries\ScriptName;

/** Register in Production Mode */
class RegisterProd {
    protected static $instance = null;

    public static function getInstance() {
        if ( null == self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /** Hooks Initialization */
    private function __construct() {
        add_action( 'init', array( $this, 'register_all_scripts' ) );
    }

    public function register_all_scripts() {
        $deps = array( 'react', 'react-dom', 'wp-hooks', 'wp-i18n' );

        // wp_register_script( ScriptName::PAGE_SETTINGS, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/main.js', $deps, YAY_BULK_ORDER_VERSION, true );

        // For testing purpose, will be deleted after testing
        wp_register_script( ScriptName::PAGE_SETTINGS, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/main.test.js', $deps, YAY_BULK_ORDER_VERSION, true );
    }
}
