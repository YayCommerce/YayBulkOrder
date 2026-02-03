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
}
