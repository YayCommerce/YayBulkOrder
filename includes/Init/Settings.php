<?php
namespace YayBulkOrder\Init;

use YayBulkOrder\Helper\Utils;
use YayBulkOrder\Engines\Registries\ScriptName;
use YayBulkOrder\I18n;
use YayBulkOrder\Helper\LogErrors;

defined( 'ABSPATH' ) || exit;

class Settings {
	protected static $instance = null;
	private $hook_suffix;

	public static function getInstance() {
		if ( null == self::$instance ) {
			self::$instance = new self();
			self::$instance->doHooks();
		}

		return self::$instance;
	}


	private function doHooks() {
		$this->hook_suffix = array( 'yay_bulk_order_main_page' );
		add_action( 'admin_menu', array( $this, 'settingsMenu' ), YAY_BULK_ORDER_MENU_PRIORITY );
		add_filter( 'admin_body_class', array( $this, 'admin_body_class' ) );
		add_filter( 'plugin_action_links_' . YAY_BULK_ORDER_PLUGIN_BASENAME, array( $this, 'pluginActionLinks' ) );

		if ( current_user_can( 'manage_options' ) ) {
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueueBulkOrderSettingsScripts' ) );
		}
	}

	private function __construct() {}

	public function settingsMenu() {
		$this->hook_suffix['yay_bulk_order_main_page'] = add_submenu_page(
			'yaycommerce',
			__( 'YayBulkOrder Manager', 'yay-bulk-order' ),
			__( 'YayBulkOrder', 'yay-bulk-order' ),
			'manage_options',
			'yay-bulk-order',
			array( $this, 'settingsPage' ),
			0
		);
	}

	public function pluginActionLinks( $links ) {
		$action_links = array(
			'settings' => '<a href="' . admin_url( 'admin.php?page=yay-bulk-order' ) . '" aria-label="' . esc_attr__( 'YayBulkOrder', 'yay-bulk-order' ) . '">' . esc_html__( 'Settings', 'yay-bulk-order' ) . '</a>',
		);
		return array_merge( $action_links, $links );
	}

	public function settingsPage() {
		echo '<div id="yay-bulk-order" class="yay-bulk-order-ui"></div>';

	}

	public function enqueueBulkOrderSettingsScripts( $screenId ) {
		if ( $screenId !== 'yaycommerce_page_yay-bulk-order' ) {
			return;
		}

		wp_enqueue_script( ScriptName::PAGE_SETTINGS );
		wp_enqueue_style( ScriptName::STYLE_SETTINGS );

		wp_localize_script(
			ScriptName::PAGE_SETTINGS,
			'yayBulkOrderWpData',
			array(
				'YAY_BULK_ORDER_PLUGIN_PATH' => YAY_BULK_ORDER_PLUGIN_PATH,
				'YAY_BULK_ORDER_PLUGIN_URL'  => YAY_BULK_ORDER_PLUGIN_URL,
				'YAY_BULK_ORDER_SITE_URL'    => YAY_BULK_ORDER_SITE_URL,
				'restUrl'                    => rest_url( 'yay-bulk-order/v1/' ),
				'nonce'                      => wp_create_nonce( 'wp_rest' ),
				'i18n'                       => I18n::getTranslation(),
			)
		);
	}

	public function admin_body_class( $classes ) {
		if ( strpos( $classes, 'yay-bulk-order-ui' ) === false ) {
			$classes .= ' yay-bulk-order-ui';
		}
		return $classes;
	}
}
