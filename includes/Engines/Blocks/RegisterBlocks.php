<?php
namespace YayBulkOrder\Engines\Blocks;

use YayBulkOrder\Services\SettingsService;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Register Blocks
 */
class RegisterBlocks {
    use SingletonTrait;

    private SettingsService $settings_service;

    protected function __construct() {
        $this->settings_service = SettingsService::get_instance();

        // add_action( 'init', [ $this, 'register_blocks' ] );
        // add_action( 'enqueue_block_assets', [ $this, 'enqueue_block_assets' ] );
        // add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_block_editor_assets' ] );
    }

    public function register_blocks() {
        $blocks_path = YAYBULKORDER_PLUGIN_PATH . 'assets/dist/blocks';

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

    public function enqueue_block_assets() {
        if ( ! is_admin() ) {
            wp_enqueue_script( 'wc-blocks-data-store' );
        }
    }

    public function enqueue_block_editor_assets() {
        wp_localize_script(
            'wp-blocks',
            'yayBulkOrderAdminData',
            $this->settings_service->get_config(),
        );
    }
}
