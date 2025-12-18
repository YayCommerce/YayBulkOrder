<?php
namespace YayBulkOrder;

defined( 'ABSPATH' ) || exit;

class I18n {
	protected static $instance = null;

	public static function getInstance() {
		if ( null == self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'loadPluginTextdomain' ) );
	}

	public function loadPluginTextdomain() {
		if ( function_exists( 'determine_locale' ) ) {
			$locale = determine_locale();
		} else {
			$locale = is_admin() ? get_user_locale() : get_locale();
		}
		unload_textdomain( 'yay' );
		load_textdomain( 'yay-bulk-order', YAY_BULK_ORDER_PLUGIN_PATH . '/i18n/languages/yay-bulk-order-' . $locale . '.mo' );
		load_plugin_textdomain( 'yay-bulk-order', false, YAY_BULK_ORDER_PLUGIN_PATH . '/i18n/languages/' );
	}

	public static function getTranslation() {
		$translations = get_translations_for_domain( 'yay-bulk-order' );
        $messages     = [];

        $entries = $translations->entries;
        foreach ( $entries as $key => $entry ) {
            $messages[ $entry->singular ] = $entry->translations;
        }

		return $messages;
	}
}
