<?php
/**
 * Plugin Name: Yay Bulk Order
 * Plugin URI: https://yaycommerce.com/yay-bulk-order
 * Description: This plugin helps you create bulk orders from your WordPress website.
 * Version: 1.0.0
 * Author: YayCommerce
 * Author URI: https://yaycommerce.com
 * Text Domain: yay-bulk-order
 * Domain Path: /i18n/languages/
 */

namespace YayBulkOrder;

use YayBulkOrder\Init\Settings;
use YayBulkOrder\Engines\Registries\RegisterFacade;

defined( 'ABSPATH' ) || exit;

if ( function_exists( 'YayBulkOrder\\init' ) ) {
	require_once ABSPATH . '/wp-admin/includes/plugin.php';
	require_once ABSPATH . WPINC . '/pluggable.php';
	deactivate_plugins( plugin_basename( __FILE__ ) );
	require_once plugin_dir_path( __FILE__ ) . 'includes/UpdateVersion.php';
	return;
}

if ( ! defined( 'YAY_BULK_ORDER_PREFIX' ) ) {
	define( 'YAY_BULK_ORDER_PREFIX', 'yay-bulk-order' );
}
if ( ! defined( 'YAY_BULK_ORDER_VERSION' ) ) {
	define( 'YAY_BULK_ORDER_VERSION', '1.0.0' );
}

if ( ! defined( 'YAY_BULK_ORDER_DOMAIN' ) ) {
	define( 'YAY_BULK_ORDER_DOMAIN', 'yay-bulk-order' );
}

if ( ! defined( 'YAY_BULK_ORDER_PLUGIN_URL' ) ) {
	define( 'YAY_BULK_ORDER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}

if ( ! defined( 'YAY_BULK_ORDER_PLUGIN_PATH' ) ) {
	define( 'YAY_BULK_ORDER_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'YAY_BULK_ORDER_PLUGIN_BASENAME' ) ) {
	define( 'YAY_BULK_ORDER_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
}

if ( ! defined( 'YAY_BULK_ORDER_SITE_URL' ) ) {
	define( 'YAY_BULK_ORDER_SITE_URL', site_url() );
}

if ( ! defined( 'YAY_BULK_ORDER_PLUGIN_NAME' ) ) {
	define( 'YAY_BULK_ORDER_PLUGIN_NAME', 'yay-bulk-order' );
}

if ( ! defined( 'YAY_BULK_ORDER_IS_DEVELOPMENT' ) ) {
	define( 'YAY_BULK_ORDER_IS_DEVELOPMENT', true );
}

require_once __DIR__ . '/autoloader.php';

	
/**
 * Callback for plugins_loaded action
 *
 * @return void
 */
if ( ! function_exists( 'YayBulkOrder\\plugins_loaded' ) ) {
	function plugins_loaded() {
		\YayBulkOrder\YayCommerceMenu\RegisterMenu::get_instance();
		// \YayBulkOrder\License\LicenseHandler::get_instance();

		// $license = new \YayBulkOrder\License\License( 'yay-bulk-order' );
		// if ( ! $license->is_active() ) {
		// 	return;
		// }

		I18n::getInstance();
		Settings::getInstance();
		
		// Register Facade
		RegisterFacade::getInstance();
		add_action( 'admin_notices', 'YayBulkOrder\\required_woocommerce_notice' );
	}
}

if ( ! function_exists( 'YayBulkOrder\\required_woocommerce_notice' ) ) {
	function required_woocommerce_notice() {
		if ( ! function_exists( 'WC' ) ) :
			?>
				<div class="error">
					<p>
					<?php
					// translators: %s: search WooCommerce plugin link
					printf( 'YayBulkOrder ' . esc_html__( 'is enabled but not effective. It requires %1$sWooCommerce%2$s in order to work.', 'yaybulkorder' ), '<a href="' . esc_url( admin_url( 'plugin-install.php?s=woocommerce&tab=search&type=term' ) ) . '">', '</a>' );
					?>
					</p>
				</div>
			<?php
		endif;
	}
}

add_action( 'plugins_loaded', 'YayBulkOrder\\plugins_loaded' );
