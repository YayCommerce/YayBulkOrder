<?php
namespace YayBulkOrder\Utils;

/**
 * Helper functions for blocks rendering.
 */
class BlockHelper {

    /**
     * @param array $attr_array The attribute array.
     * @return string The escaped attribute string.
     */
    public static function esc_attr_array( array $attr_array ): string {
        if ( empty( $attr_array ) ) {
            return '';
        }

        $normalized_attributes = [];
        foreach ( $attr_array as $key => $value ) {
            $normalized_attributes[] = $key . '="' . esc_attr( $value ) . '"';
        }

        return implode( ' ', $normalized_attributes );
    }

    public static function get_page_param( int $query_id = 0 ) {
        $page_key = 'query-' . $query_id . '-page';
        /* phpcs:disable WordPress.Security.NonceVerification.Recommended */
        return empty( $_GET[ $page_key ] ) ? 1 : (int) $_GET[ $page_key ];
    }

    public static function get_filter_param( int $query_id = 0 ) {
        $filter_key = 'query-' . $query_id . '-filter';
        /* phpcs:disable WordPress.Security.NonceVerification.Recommended */
        $filter_param = empty( $_GET[ $filter_key ] ) ? 'all' : sanitize_text_field( wp_unslash( $_GET[ $filter_key ] ) );
        $filter_enums = [ 'all', 'in-stock', 'on-sale' ];
        if ( ! in_array( $filter_param, $filter_enums, true ) ) {
            $filter_param = 'all';
        }
        return $filter_param;
    }

    public static function get_search_param( int $query_id = 0 ) {
        $search_key = 'query-' . $query_id . '-search';
        /* phpcs:disable WordPress.Security.NonceVerification.Recommended */
        return empty( $_GET[ $search_key ] ) ? '' : sanitize_text_field( wp_unslash( $_GET[ $search_key ] ) );
    }

    public static function get_category_param( int $query_id = 0 ) {
        $category_key = 'query-' . $query_id . '-category';
        /* phpcs:disable WordPress.Security.NonceVerification.Recommended */
        if ( empty( $_GET[ $category_key ] ) ) {
            return [];
        }
        $raw_value = sanitize_text_field( wp_unslash( $_GET[ $category_key ] ) );
        $slugs     = array_map( 'sanitize_title', explode( ',', $raw_value ) );

        return array_values( array_filter( $slugs ) );
    }

    public static function build_query_url( int $query_id, array $updates ): string {
        $url = null;
        foreach ( $updates as $suffix => $value ) {
            $key = 'query-' . $query_id . '-' . $suffix;
            if ( null === $value || '' === $value ) {
                $url = null === $url ? remove_query_arg( $key ) : remove_query_arg( $key, $url );
            } else {
                $url = null === $url ? add_query_arg( $key, $value ) : add_query_arg( $key, $value, $url );
            }
        }
        return esc_url( (string) $url );
    }

    /**
     * Recursively checks whether a block of the given name appears anywhere
     * in a parsed block tree (e.g. `$block->parsed_block['innerBlocks']`),
     * regardless of how deeply it's nested.
     *
     * @param array  $inner_blocks Parsed inner blocks, as returned by `parse_blocks()`.
     * @param string $block_name   Fully-qualified block name to look for.
     */
    public static function inner_blocks_contain( array $inner_blocks, string $block_name ): bool {
        foreach ( $inner_blocks as $inner_block ) {
            if ( ( $inner_block['blockName'] ?? null ) === $block_name ) {
                return true;
            }
            if ( ! empty( $inner_block['innerBlocks'] ) && self::inner_blocks_contain( $inner_block['innerBlocks'], $block_name ) ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Registers every block found in a `blocks-manifest.php` metadata
     * collection. Shared by the free and Pro block registries so each one
     * only has to point at its own `assets/dist/...` directory.
     *
     * @param string $blocks_path Absolute path to the collection's directory.
     */
    public static function register_block_collection( string $blocks_path ): void {
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

    public static function get_pagination_range( int $current_page, int $total_pages ): array {
        $window = 1;
        $range  = [];

        for ( $page = 1; $page <= $total_pages; $page++ ) {
            if ( 1 === $page || $total_pages === $page || abs( $page - $current_page ) <= $window ) {
                $range[] = $page;
            } elseif ( end( $range ) !== null ) {
                $range[] = null;
            }
        }

        return $range;
    }
}
