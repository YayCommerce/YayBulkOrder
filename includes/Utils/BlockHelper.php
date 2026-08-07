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
