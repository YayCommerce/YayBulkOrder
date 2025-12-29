<?php
/**
 * Plugin Name: Yay Bulk Order
 * Plugin URI: https://yaycommerce.com/yay-bulk-order
 * Description: This plugin helps you create bulk orders from your WordPress website.
 * Version: 1.0.0
 * Author: YayCommerce
 * Author URI: https://yaycommerce.com
 * Text Domain: yay-bulk-order
 * Domain Path: /languages
 *
 * @package yaycommerce/yay-bulk-order
 */

namespace YayBulkOrder;

defined( 'ABSPATH' ) || exit;

if ( function_exists( 'YayBulkOrder\\initialize_plugin' ) ) {
    require_once plugin_dir_path( __FILE__ ) . 'includes/Fallback.php';
    add_action(
        'admin_init',
        function () {
            deactivate_plugins( plugin_basename( __FILE__ ) );
        }
    );
}

define( 'YAY_BULK_ORDER_VERSION', '1.0.0' );
define( 'YAY_BULK_ORDER_FILE', __FILE__ );
define( 'YAY_BULK_ORDER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'YAY_BULK_ORDER_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'YAY_BULK_ORDER_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

define( 'YAY_BULK_ORDER_IS_DEVELOPMENT', true );

if ( ! function_exists( 'YayBulkOrder\\initialize_plugin' ) ) {
    require_once __DIR__ . '/autoloader.php';
    function initialize_plugin() {
        \YayBulkOrder\YayCommerceMenu\RegisterMenu::get_instance();

        // \YayBulkOrder\License\LicenseHandler::get_instance();
        // $license = new \YayBulkOrder\License\License( 'yay-bulk-order' );
        // if ( ! $license->is_active() ) {
        // return;
        // }

        \YayBulkOrder\Initialize::get_instance();
    }
}


if ( ! wp_installing() ) {
    add_action( 'plugins_loaded', 'YayBulkOrder\\initialize_plugin' );
}

function activate_plugin( $network_wide ) {
    if ( class_exists( '\YayBulkOrder\Engine\ActDeact' ) ) {
        \YayBulkOrder\Engine\ActDeact::activate( $network_wide );
    }
}
function deactivate_plugin( $network_wide ) {
    if ( class_exists( '\YayBulkOrder\Engine\ActDeact' ) ) {
        \YayBulkOrder\Engine\ActDeact::deactivate( $network_wide );
    }
}
function uninstall_plugin() {
    if ( class_exists( '\YayBulkOrder\Engine\ActDeact' ) ) {
        \YayBulkOrder\Engine\ActDeact::uninstall();
    }
}
register_activation_hook( YAY_BULK_ORDER_FILE, 'YayBulkOrder\\activate_plugin' );
register_deactivation_hook( YAY_BULK_ORDER_FILE, 'YayBulkOrder\\deactivate_plugin' );
register_uninstall_hook( YAY_BULK_ORDER_FILE, 'YayBulkOrder\\uninstall_plugin' );
