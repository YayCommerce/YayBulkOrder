<?php
namespace YayBulkOrder\Engines\Blocks;

use WP_Block_Patterns_Registry;
use YayBulkOrder\Services\LocalizeService;
use YayBulkOrder\Utils\BlockHelper;
use YayBulkOrder\Services\PatternService;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Register Blocks
 */
class RegisterBlocks {
    use SingletonTrait;

    private LocalizeService $localize_service;
    private PatternService $pattern_service;

    /**
     * Per-request count of how many times each baked-in `queryId` has been
     * seen so far, keyed by that original queryId. Used by
     * disambiguate_query_id() to keep two Product Table instances that
     * happen to share the same queryId (e.g. the same static pattern
     * inserted twice on one page) from reading/writing each other's
     * query-{id}-* URL filter params.
     *
     * @var array<int|string, int>
     */
    private array $seen_query_ids = [];

    protected function __construct() {
        $this->localize_service = LocalizeService::get_instance();
        $this->pattern_service  = PatternService::get_instance();

        add_action( 'init', [ $this, 'register_blocks' ] );
        add_filter( 'render_block', [ $this, 'enqueue_cart_data_store' ], 10, 2 );
        add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_block_editor_assets' ] );
        add_filter( 'render_block_data', [ $this, 'disambiguate_query_id' ] );
    }

    /**
     * Rewrites a Product Table root block's `queryId` attribute the 2nd+
     * time that same queryId is seen while rendering the current request.
     *
     * `providesContext` resolves a block's context from its *attributes*
     * before render.php ever runs, so render.php itself can't fix this up
     * for its children after the fact — this filter is the one hook that
     * runs early enough (`render_block_data`, before the block is turned
     * into a WP_Block) to change what every descendant (filter sidebar,
     * pagination, search) — and this block's own
     * `data-wp-router-region` — end up seeing.
     *
     * The editor already assigns a fresh queryId when it detects a
     * collision between sibling blocks in the *same* post (see
     * table-root/edit.tsx), but that never runs for content assembled
     * outside the block editor: the `[yaybulkorder-product-table]` shortcode (which
     * always bakes `queryId: 1`), or any post content built programmatically
     * (stashed "apply to a new page" content, migrations, tests). This is
     * the catch-all for those paths.
     *
     * Offsets rather than string-suffixes the id (`base + occurrence *
     * 100_000_000`) so `queryId` stays a plain int everywhere downstream —
     * no type changes needed in BlockHelper or the JS store.
     *
     * @param array $parsed_block The parsed block, as WordPress is about to render it.
     * @return array
     */
    public function disambiguate_query_id( array $parsed_block ): array {
        if ( 'yay-bulk-order/product-table-root' !== ( $parsed_block['blockName'] ?? null ) ) {
            return $parsed_block;
        }

        $base_query_id = $parsed_block['attrs']['queryId'] ?? 0;
        $occurrence    = $this->seen_query_ids[ $base_query_id ] ?? 0;

        $this->seen_query_ids[ $base_query_id ] = $occurrence + 1;

        if ( $occurrence > 0 ) {
            $parsed_block['attrs']['queryId'] = $base_query_id + ( $occurrence * 100000000 );
        }

        return $parsed_block;
    }

    public function register_blocks() {
        BlockHelper::register_block_collection( YAYBULKORDER_PLUGIN_PATH . 'assets/dist/blocks/product-table' );
        BlockHelper::register_block_collection( YAYBULKORDER_PLUGIN_PATH . 'assets/dist/blocks/common' );
    }

    /**
     * Load the WooCommerce cart store only on pages that render a plugin block.
     *
     * @param string $block_content Rendered block HTML, returned as is.
     * @param array  $block         The parsed block.
     * @return string
     */
    public function enqueue_cart_data_store( $block_content, $block ) {
        if ( ! is_admin() && 0 === strpos( (string) ( $block['blockName'] ?? '' ), 'yay-bulk-order/' ) ) {
            wp_enqueue_script( 'wc-blocks-data-store' );
        }

        return $block_content;
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
