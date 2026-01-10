<?php
namespace YayBulkOrder\Research;

use YayBulkOrder\Utils\SingletonTrait;

/**
 * Register Blocks
 */
class RegisterBlocks {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'init', [ $this, 'register_blocks' ] );
        add_action( 'get_block_type_variations', [ $this, 'register_block_variations' ], 10, 2 );
    }

    public function register_blocks() {
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

    public function register_block_variations( $variations, $block_type ) {
        // Only modify variations for the image block
        if ( 'woocommerce/product-collection' !== $block_type->name ) {
            return $variations;
        }

        // Add a custom variation
        $variations[] = [
            'name'        => 'yay-bulk-order/bulk-order-form',
            'title'       => __( 'Bulk Order Form', 'yay-bulk-order' ),
            'description' => __( 'Display products in a bulk order form layout', 'yay-bulk-order' ),
            'scope'       => [ 'inserter' ],
            'isDefault'   => false,
        ];

        return $variations;
    }
}
