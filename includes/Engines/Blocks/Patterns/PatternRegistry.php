<?php
namespace YayBulkOrder\Engines\Blocks\Patterns;

use YayBulkOrder\Utils\SingletonTrait;

class PatternRegistry {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'init', [ $this, 'register' ] );
    }

    public function register() {

        if ( ! function_exists( 'register_block_pattern' ) ) {
            return;
        }

        $this->register_categories();
        $this->register_patterns();
    }

    /**
     * Register all pattern categories
     */
    protected function register_categories() {
        register_block_pattern_category(
            'yay-bulk-order',
            [
                'label' => __( 'Bulk Order', 'yay-bulk-order' ),
            ]
        );
    }

    /**
     * Register all patterns
     */
    protected function register_patterns() {

        $patterns = [
            [
                'slug'        => 'yay-bulk-order/simple-bulk-order',
                'title'       => __( 'Simple Bulk Order', 'yay-bulk-order' ),
                'description' => __( 'Simple bulk order table.', 'yay-bulk-order' ),
                'categories'  => [ 'yay-bulk-order' ],
                'content'     => PatternRenderer::render( 'simple' ),
            ],
            [
                'slug'        => 'yay-bulk-order/filterable-bulk-order',
                'title'       => __( 'Filterable Bulk Order', 'yay-bulk-order' ),
                'description' => __( 'Bulk order table with filters.', 'yay-bulk-order' ),
                'categories'  => [ 'yay-bulk-order' ],
                'content'     => PatternRenderer::render( 'filterable' ),
            ],
        ];

        foreach ( $patterns as $pattern ) {
            if ( empty( $pattern['content'] ) ) {
                continue;
            }

            register_block_pattern(
                $pattern['slug'],
                $pattern
            );
        }
    }
}
