<?php
namespace YayBulkOrder\Test\Shortcode;

use YayBulkOrder\Engines\Registries\ScriptName;
use YayBulkOrder\I18n;

defined( 'ABSPATH' ) || exit;

/**
 * Bulk Order Test Shortcode
 */
class BulkOrderTable {
	protected static $instance = null;

	public static function getInstance() {
		if ( null == self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'register_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	public function register_shortcode() {
		add_shortcode( 'yay_bulk_order_test', array( $this, 'render_shortcode' ) );
	}


	/**
	 * Enqueue scripts and styles when shortcode is present
	 */
	public function enqueue_scripts() {
		global $post;

		// Only enqueue if shortcode is present on the page
		// if ( ! is_a( $post, 'WP_Post' ) || ! has_shortcode( $post->post_content, 'yay_bulk_order_test' ) ) {
		// 	return;
		// }

		// Localize script before enqueuing
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

		wp_enqueue_script( ScriptName::PAGE_SETTINGS );
		wp_enqueue_style( ScriptName::STYLE_SETTINGS );
	}


	/**
	 * Render the shortcode
	 */
	public function render_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'id' => 'yay-bulk-order-test',
			),
			$atts,
			'yay_bulk_order_test'
		);

		return '<div id="' . esc_attr( $atts['id'] ) . '" class="yay-bulk-order-test yay-ui"></div>';
	}
}

