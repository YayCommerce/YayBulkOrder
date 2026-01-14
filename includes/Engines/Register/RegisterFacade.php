<?php
namespace YayBulkOrder\Engines\Register;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Engines\Register\ScriptName;

/**
 * Register Facade.
 *
 * @method static RegisterFacade get_instance()
 */
class RegisterFacade {
    use SingletonTrait;

    /** Hooks Initialization */
    private function __construct() {
        add_filter( 'script_loader_tag', [ $this, 'add_entry_as_module' ], 10, 3 );
        add_action( 'init', [ $this, 'register_all_assets' ] );

        $is_prod = ! defined( 'YAY_BULK_ORDER_IS_DEVELOPMENT' ) || YAY_BULK_ORDER_IS_DEVELOPMENT !== true;
        if ( $is_prod && class_exists( '\YayBulkOrder\Engines\Register\RegisterProd' ) ) {
            \YayBulkOrder\Engines\Register\RegisterProd::get_instance();
        } elseif ( ! $is_prod && class_exists( '\YayBulkOrder\Engines\Register\RegisterDev' ) ) {
            \YayBulkOrder\Engines\Register\RegisterDev::get_instance();
        }
    }

    public function add_entry_as_module( $tag, $handle ) {
        if ( strpos( $handle, ScriptName::MODULE_PREFIX ) === false ) {
            return $tag;
        }

        // $handle could has special characters yay-plugin/module/admin-page
        $handle_regex = str_replace( '/', '\/', $handle );
        // find the string begin with '<script' and end with '</script>' between having 'id="' . $handle . '-js"'
        $pattern = '/<script[^>]*id="' . $handle_regex . '-js"[^>]*>.*?<\/script>/';
        preg_match( $pattern, $tag, $matches );

        if ( null !== $matches && count( $matches ) > 0 ) {
            $script_tag = $matches[0];

            if ( strpos( $script_tag, 'type="' ) !== false ) {
                $module_tag = preg_replace( '/\stype="\S+\s/', ' type="module" ', $script_tag, -1 );
            } else {
                $module_tag = str_replace( ' src=', ' type="module" src=', $script_tag );
            }

            return str_replace( $script_tag, $module_tag, $tag );
        }

        return $tag;
    }

    public function register_all_assets() {
        wp_register_style( ScriptName::STYLE_ADMIN_PAGE, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/admin-page/style.css', [], YAY_BULK_ORDER_VERSION );

        $utils_asset = require_once YAY_BULK_ORDER_PLUGIN_PATH . 'assets/dist/utils/utils.entry.ts.asset.php';
        wp_register_script( ScriptName::UTILS_SCRIPT, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/utils/utils.entry.ts.js', $utils_asset['dependencies'], $utils_asset['version'], true );
        wp_set_script_translations( ScriptName::UTILS_SCRIPT, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );

        $view_asset = require_once YAY_BULK_ORDER_PLUGIN_PATH . 'assets/dist/view/bulk-order-view.asset.php';
        wp_register_script_module( ScriptName::VIEW_MODULE, YAY_BULK_ORDER_PLUGIN_URL . 'assets/dist/view/bulk-order-view.js', $view_asset['dependencies'], $view_asset['version'] );
        wp_set_script_translations( ScriptName::VIEW_MODULE, 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . 'languages' );
    }
}
