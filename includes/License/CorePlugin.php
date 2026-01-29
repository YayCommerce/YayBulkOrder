<?php

namespace YayBulkOrder\License;

defined( 'ABSPATH' ) || exit;

class CorePlugin {

	public static function get( $name ) {
		$data = array(
			'path'        => YAY_BULK_ORDER_PLUGIN_PATH,
			'url'         => YAY_BULK_ORDER_PLUGIN_URL,
			'basename'    => YAY_BULK_ORDER_PLUGIN_BASENAME,
			'version'     => YAY_BULK_ORDER_VERSION,
			'slug'        => 'yay-bulk-order',
			'link'        => 'https://yaycommerce.com/yay-bulk-order/',
			'download_id' => '5270',
		);

		if ( isset( $data[ $name ] ) ) {
			return $data[ $name ];
		}
		return null;
	}
}
