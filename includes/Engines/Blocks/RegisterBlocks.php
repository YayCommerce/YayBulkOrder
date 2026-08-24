<?php
namespace YayBulkOrder\Engines\Blocks;

use YayBulkOrder\Services\LocalizeService;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Register Blocks
 */
class RegisterBlocks {
    use SingletonTrait;

    private LocalizeService $localize_service;

    protected function __construct() {
        $this->localize_service = LocalizeService::get_instance();

        add_action( 'init', [ $this, 'register_blocks' ] );
        add_action( 'enqueue_block_assets', [ $this, 'enqueue_block_assets' ] );
        add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_block_editor_assets' ] );
    }

    public function register_blocks() {
        $this->register_collection( YAYBULKORDER_PLUGIN_PATH . 'assets/dist/blocks/product-table' );
        $this->register_collection( YAYBULKORDER_PLUGIN_PATH . 'assets/dist/blocks/common' );
    }

    public function enqueue_block_assets() {
        if ( ! is_admin() ) {
            wp_enqueue_script( 'wc-blocks-data-store' );
        }
    }

    public function enqueue_block_editor_assets() {
        wp_localize_script(
            'wp-blocks',
            LocalizeService::VAR_ADMIN_DATA,
            $this->localize_service->get_admin_data(),
        );

        // Needed by the Product Table block's editor to call the plugin's
        // own REST endpoints (category checklist, hand-picked product search).
        wp_localize_script(
            'wp-blocks',
            LocalizeService::VAR_META,
            $this->localize_service->get_meta(),
        );
    }

    private function register_collection( string $blocks_path ) {
        if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
            wp_register_block_types_from_metadata_collection( $blocks_path, $blocks_path . '/blocks-manifest.php' );
            return;
        }

        if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
            wp_register_block_metadata_collection( $blocks_path, $blocks_path . '/blocks-manifest.php' );
        }

        $manifest_data = require $blocks_path . '/blocks-manifest.php';
        foreach ( array_keys( $manifest_data ) as $block_type ) {
            register_block_type( $blocks_path . "/{$block_type}" );
        }
    }
}
