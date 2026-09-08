<?php
namespace YayBulkOrder\Engines\Blocks;

use WP_Block_Patterns_Registry;
use YayBulkOrder\Services\LocalizeService;
use YayBulkOrder\Utils\BlockHelper;
use YayBulkOrder\Services\PatternService;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Register Blocks
 */
class RegisterBlocks {
    use SingletonTrait;

    private LocalizeService $localize_service;
    private PatternService $pattern_service;

    protected function __construct() {
        $this->localize_service = LocalizeService::get_instance();
        $this->pattern_service  = PatternService::get_instance();

        add_action( 'init', [ $this, 'register_blocks' ] );
        add_action( 'enqueue_block_assets', [ $this, 'enqueue_block_assets' ] );
        add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_block_editor_assets' ] );
    }

    public function register_blocks() {
        BlockHelper::register_block_collection( YAYBULKORDER_PLUGIN_PATH . 'assets/dist/blocks/product-table' );
        BlockHelper::register_block_collection( YAYBULKORDER_PLUGIN_PATH . 'assets/dist/blocks/common' );
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
}
