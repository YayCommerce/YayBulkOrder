<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Load and render patterns
 *
 * @method static PatternService get_instance()
 */
class PatternService {
    use SingletonTrait;

    /**
     * Render pattern from PHP file
     *
     * @param string $pattern_slug The pattern slug (e.g. 'simple', 'filterable').
     * @return string The rendered pattern.
     */
    public function render_pattern( string $pattern_slug ): string {
        $path = YAYBULKORDER_PLUGIN_PATH . 'patterns/' . $pattern_slug . '.php';

        if ( ! file_exists( $path ) ) {
            return '';
        }

        ob_start();
        include $path;
        $pattern_content = ob_get_clean();

        return $pattern_content;
    }

    public function render_table_columns( array $columns ): string {
        $columns_list = self::get_columns_list();
        $columns      = array_intersect( $columns, $columns_list );
        if ( empty( $columns ) ) {
            return '';
        }

        $table_columns = '';
        foreach ( $columns as $column ) {
            $table_columns .= '<!-- wp:' . $column . ' /-->';
        }

        return sprintf(
            '<!-- wp:yay-bulk-order/table-template -->%s<!-- /wp:yay-bulk-order/table-template -->',
            $table_columns
        );
    }

    public function render_shortcode( string $pattern_slug, array $columns ): string {
        $pattern_content       = self::render_pattern( $pattern_slug );
        $table_columns_content = self::render_table_columns( $columns );

        if ( empty( $table_columns_content ) ) {
            return $pattern_content;
        }

        // replace <!-- wp:yay-bulk-order/table-template -->[content]<!-- /wp:yay-bulk-order/table-template -->
        $pattern_content = preg_replace(
            '/<!-- wp:yay-bulk-order\/table-template -->.*<!-- \/wp:yay-bulk-order\/table-template -->/s',
            $table_columns_content,
            $pattern_content
        );

        return $pattern_content;
    }

    private function get_columns_list() {
        return [
            'yay-bulk-order/column-product-title',
            'yay-bulk-order/column-product-price',
            'yay-bulk-order/column-product-sku',
            'yay-bulk-order/column-product-stock',
            'yay-bulk-order/column-add-to-cart',
        ];
    }
}
