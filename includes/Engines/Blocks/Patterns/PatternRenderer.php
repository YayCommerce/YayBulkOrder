<?php
namespace YayBulkOrder\Engines\Blocks\Patterns;

/**
 * Renders block pattern templates from PHP files.
 */
class PatternRenderer {

    public static function render( string $view, ?array $columns = null ): string {
        $path = YAY_BULK_ORDER_PLUGIN_PATH . 'patterns/' . $view . '.php';

        if ( ! file_exists( $path ) ) {
            return '';
        }

        ob_start();
        include $path;
        $pattern_content = ob_get_clean();

        // If column order is provided, modify the pattern to reorder columns
        if ( ! empty( $columns ) && is_array( $columns ) ) {
            $pattern_content = self::reorder_columns( $pattern_content, $columns );
        }

        return $pattern_content;
    }

    /**
     * Reorder columns in the pattern content based on the provided column order.
     *
     * @param string $pattern_content The pattern HTML content.
     * @param array  $columns    Array of column block names in desired order.
     * @return string Modified pattern content.
     */
    private static function reorder_columns( string $pattern_content, array $columns ): string {
        // Find the table-template block and its inner blocks
        // Pattern: <!-- wp:yay-bulk-order/table-template -->
        // <!-- wp:yay-bulk-order/column-* /-->
        // <!-- /wp:yay-bulk-order/table-template -->

        // Extract all column blocks from the pattern with their full markup
        $column_pattern = '/<!--\s*wp:yay-bulk-order\/(column-[^\s]+)\s*(\/?-->(?:\s*<!--\s*\/wp:yay-bulk-order\/\1\s*-->)?)/';
        preg_match_all( $column_pattern, $pattern_content, $matches, PREG_OFFSET_CAPTURE );

        if ( empty( $matches[1] ) ) {
            return $pattern_content;
        }

        // Map found columns to their full block markup (including any closing tags)
        $column_blocks = [];
        foreach ( $matches[0] as $index => $full_match ) {
            $block_name = 'yay-bulk-order/' . $matches[1][ $index ][0];
            $markup     = $full_match[0];

            $column_blocks[ $block_name ] = $markup;
        }

        // Reorder columns based on the provided order
        $reordered_blocks = [];
        $used_columns     = [];

        // First, add columns in the specified order
        foreach ( $columns as $column_name ) {
            if ( isset( $column_blocks[ $column_name ] ) ) {
                $reordered_blocks[] = $column_blocks[ $column_name ];
                $used_columns[]     = $column_name;
            }
        }

        // Add any columns that weren't in the order list (preserve them at the end)
        foreach ( $column_blocks as $column_name => $markup ) {
            if ( ! in_array( $column_name, $used_columns, true ) ) {
                $reordered_blocks[] = $markup;
            }
        }

        // Replace the original column blocks with reordered ones
        // Find the table-template opening and closing tags
        $table_template_pattern = '/(<!--\s*wp:yay-bulk-order\/table-template[^>]*-->)(.*?)(<!--\s*\/wp:yay-bulk-order\/table-template\s*-->)/s';

        return preg_replace_callback(
            $table_template_pattern,
            function ( $matches ) use ( $reordered_blocks ) {
                $opening_tag   = $matches[1];
                $inner_content = $matches[2];
                $closing_tag   = $matches[3];

                // Remove existing column blocks from inner content (preserve other content like whitespace)
                $cleaned_content = preg_replace( '/<!--\s*wp:yay-bulk-order\/column-[^\s]+\s*\/?-->(?:\s*<!--\s*\/wp:yay-bulk-order\/column-[^\s]+\s*-->)?/', '', $inner_content );

                // Clean up extra newlines
                $cleaned_content = preg_replace( '/\n{3,}/', "\n\n", $cleaned_content );

                // Insert reordered column blocks with proper formatting
                $new_columns = "\n" . implode( "\n\n", $reordered_blocks ) . "\n";

                return $opening_tag . $cleaned_content . $new_columns . $closing_tag;
            },
            $pattern_content
        );
    }
}
