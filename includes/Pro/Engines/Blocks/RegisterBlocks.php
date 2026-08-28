<?php
namespace YayBulkOrder\Pro\Engines\Blocks;

use YayBulkOrder\Services\PatternService;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Register Blocks
 */
class RegisterBlocks {
    use SingletonTrait;

    private PatternService $pattern_service;

    protected function __construct() {
        $this->pattern_service = PatternService::get_instance();

        add_action( 'init', [ $this, 'register_blocks' ] );
        add_filter( 'yaybulkorder_block_patterns', [ $this, 'pro_patterns' ] );
    }

    public function register_blocks() {
        $this->pattern_service->register_collection( YAYBULKORDER_PLUGIN_PATH . 'assets/dist/blocks-pro/' );
    }

    public function pro_patterns( array $patterns ) {
        return array_merge(
            $patterns,
            [
                [
                    'slug'        => 'yay-bulk-order/purchase-list',
                    'title'       => __( 'Purchase List', 'yay-bulk-order' ),
                    'description' => __( 'Save frequently ordered items into named lists for one-click re-ordering. Perfect for B2B customers with recurring orders.', 'yay-bulk-order' ),
                    'content'     => $this->pattern_service->render_pattern( 'purchase-list' ),
                ],
                [
                    'slug'        => 'yay-bulk-order/csv-order',
                    'title'       => __( 'Quick Order via CSV', 'yay-bulk-order' ),
                    'description' => __( 'Bulk Adding to cart quickly with just a csv file uploaded', 'yay-bulk-order' ),
                    'content'     => $this->pattern_service->render_pattern( 'csv-order' ),
                ],
            ]
        );
    }
}
