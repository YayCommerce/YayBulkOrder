<?php
namespace YayBulkOrder\Pro\Engines\Blocks;

use YayBulkOrder\Utils\BlockHelper;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the Pro-only block collections under assets/dist/blocks-pro —
 * one per block family (e.g. `variant-table`), same convention as the free
 * `Engines\Blocks\RegisterBlocks` registering `product-table` and `common`
 * separately. Kept separate from the free registry so the free build never
 * has to know this directory exists.
 */
class RegisterBlocks {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'init', [ $this, 'register_blocks' ] );
    }

    public function register_blocks() {
        $this->register_collection_if_built( 'variant-table' );
    }

    private function register_collection_if_built( string $family ) {
        $blocks_path = YAYBULKORDER_PLUGIN_PATH . 'assets/dist/blocks-pro/' . $family;

        if ( ! file_exists( $blocks_path . '/blocks-manifest.php' ) ) {
            return;
        }

        BlockHelper::register_block_collection( $blocks_path );
    }
}
