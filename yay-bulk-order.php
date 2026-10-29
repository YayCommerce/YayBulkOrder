<?php
/**
 * Plugin Name:       Yay Bulk Order for WooCommerce
 * Plugin URI:        https://yaycommerce.com/
 * Description:       WooCommerce plugin for quick bulk ordering.
 * Version:           0.2.1.7
 * Author:            YayCommerce
 * Author URI:        https://yaycommerce.com
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       yay-bulk-order
 * Domain Path:       /languages
 * Requires at least: 6.8
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 * WC requires at least: 10.0.0
 * WC tested up to: 11.2
 *
 * @package yaycommerce/yay-bulk-order
 */

namespace YayBulkOrder;

defined( 'ABSPATH' ) || exit;

if ( function_exists( 'YayBulkOrder\\plugin_init' ) ) {
    require_once plugin_dir_path( __FILE__ ) . 'includes/Fallback.php';
    add_action(
        'admin_init',
        function () {
            deactivate_plugins( plugin_basename( __FILE__ ) );
        }
    );
}

if ( ! defined( 'YAYBULKORDER_VERSION' ) ) {
    define( 'YAYBULKORDER_VERSION', '0.2.1.7' );
    define( 'YAYBULKORDER_FILE', __FILE__ );
    define( 'YAYBULKORDER_PLUGIN_URL', plugin_dir_url( YAYBULKORDER_FILE ) );
    define( 'YAYBULKORDER_PLUGIN_PATH', plugin_dir_path( YAYBULKORDER_FILE ) );
    define( 'YAYBULKORDER_PLUGIN_BASENAME', plugin_basename( YAYBULKORDER_FILE ) );

    define( 'YAYBULKORDER_MENU_ORDER', 20 );
    define( 'YAYBULKORDER_MENU_PRIORITY', 95 );
}

if ( ! function_exists( 'YayBulkOrder\\plugin_init' ) ) {
    require_once YAYBULKORDER_PLUGIN_PATH . 'vendor/autoload.php';
    function plugin_init() {
        \YayBulkOrderScoped\YayCommerce\AdminShell\AdminShell::boot();

        if ( ! function_exists( 'WC' ) ) {
            add_action(
                'admin_notices',
                function () {
                    /* translators: %s: Woocommerce link */
                    echo '<div class="error"><p><strong>' . sprintf( esc_html__( 'YayBulkOrder is enabled but not effective. It requires %s in order to work', 'yay-bulk-order' ), '<a href="' . esc_url( admin_url( 'plugin-install.php?s=woocommerce&tab=search&type=term' ) ) . '">WooCommerce</a>' ) . '</strong></p></div>';
                }
            );
            return;
        }

        YayBulkOrder::initialize();
        add_action( 'init', [ I18n::class, 'load_plugin_textdomain' ] );
    }
}//end if


if ( ! wp_installing() ) {
    add_action( 'plugins_loaded', 'YayBulkOrder\\plugin_init' );
}

register_activation_hook( YAYBULKORDER_FILE, [ \YayBulkOrder\Engines\ActDeact::class, 'activate' ] );
register_deactivation_hook( YAYBULKORDER_FILE, [ \YayBulkOrder\Engines\ActDeact::class, 'deactivate' ] );
register_uninstall_hook( YAYBULKORDER_FILE, [ \YayBulkOrder\Engines\ActDeact::class, 'uninstall' ] );
