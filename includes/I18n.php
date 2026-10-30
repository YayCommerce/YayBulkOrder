<?php

namespace YayBulkOrder;

defined( 'ABSPATH' ) || exit;
/**
 * I18n Logic
 */
class I18n {

    public static function load_plugin_textdomain() {
        if ( function_exists( 'determine_locale' ) ) {
            $locale = determine_locale();
        } else {
            $locale = is_admin() ? get_user_locale() : get_locale();
        }
        unload_textdomain( 'yay-bulk-order' );
        load_textdomain( 'yay-bulk-order', YAYBULKORDER_PLUGIN_PATH . '/languages/yay-bulk-order-' . $locale . '.mo' );
    }
}
