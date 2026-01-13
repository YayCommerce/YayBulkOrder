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
        $deps = [ 'react', 'react-dom', 'wp-hooks', 'wp-i18n', ScriptName::UTILS_SCRIPT ];

        wp_register_script( ScriptName::ADMIN_PAGE, 'http://localhost:3000/admin-page.tsx', $deps, null, true ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
        wp_set_script_translations( ScriptName::ADMIN_PAGE, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );

        wp_register_script( ScriptName::UTILS_SCRIPT, false, [], null, true ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
        wp_set_script_translations( ScriptName::UTILS_SCRIPT, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );

        $view_asset = require_once YAY_BULK_ORDER_PLUGIN_PATH . 'assets/dist/view/bulk-order-view.asset.php';
        wp_register_script_module( ScriptName::VIEW_MODULE, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/view/bulk-order-view.js', $view_asset['dependencies'], $view_asset['version'] );
        wp_set_script_translations( ScriptName::VIEW_MODULE, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );
    }
}
