<?php
namespace YayBulkOrder\Research;

use YayBulkOrder\Utils\SingletonTrait;

/**
 * Register Blocks
 */
class RegisterBlocks {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'init', [ $this, 'register_todo_list_block' ] );
    }

    public function register_todo_list_block() {
        $blocks_path = YAY_BULK_ORDER_PLUGIN_PATH . 'assets/dist/blocks';

        if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
            \wp_register_block_types_from_metadata_collection( $blocks_path, $blocks_path . '/blocks-manifest.php' );
            return;
        }

        if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
            \wp_register_block_metadata_collection( $blocks_path, $blocks_path . '/blocks-manifest.php' );
        }

        $manifest_data = require YAY_BULK_ORDER_PLUGIN_PATH . 'assets/dist/blocks/blocks-manifest.php';
        foreach ( array_keys( $manifest_data ) as $block_type ) {
            register_block_type( YAY_BULK_ORDER_PLUGIN_PATH . "assets/dist/blocks/{$block_type}" );
        }
    }
}
