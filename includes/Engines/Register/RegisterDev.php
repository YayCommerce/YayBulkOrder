<?php
namespace YayBulkOrder\Engines\Register;

use YayBulkOrder\Engines\Register\ScriptName;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Register in Development Mode
 * Will get deleted in production
 */
class RegisterDev {
    use SingletonTrait;

    /** Hooks Initialization */
    private function __construct() {
        add_action( 'admin_footer', [ $this, 'render_dev_refresh' ], 5 );

        add_action( 'init', [ $this, 'register_all_scripts' ] );
    }

    public function render_dev_refresh() {
        echo '<script type="module">
        import RefreshRuntime from "http://localhost:3000/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
        </script>';
    }

    public function register_all_scripts() {
        $deps = [ 'react', 'react-dom', 'wp-hooks', 'wp-i18n' ];

        wp_register_script( ScriptName::APP_ADMIN, 'http://localhost:3000/app-admin.tsx', $deps, null, true ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
        wp_set_script_translations( ScriptName::APP_ADMIN, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );
    }
}
