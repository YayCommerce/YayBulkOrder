<?php
namespace YayBulkOrder\Engines;

use YayBulkOrder\Utils\SingletonTrait;

/**
 * Load I18n
 *
 * @method static I18n get_instance()
 */
class I18n {
    use SingletonTrait;

    private function __construct() {
        add_action( 'init', [ $this, 'load_plugin_textdomain' ] );
    }

    public function load_plugin_textdomain() {
        if ( function_exists( 'determine_locale' ) ) {
            $locale = determine_locale();
        } else {
            $locale = is_admin() ? get_user_locale() : get_locale();
        }
        unload_textdomain( 'yay-bulk-order' );
        load_textdomain( 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . '/languages/yay-bulk-order-' . $locale . '.mo' );
        load_plugin_textdomain( 'yay-bulk-order', false, YAY_BULK_ORDER_PLUGIN_PATH . '/languages/' );
    }
}
