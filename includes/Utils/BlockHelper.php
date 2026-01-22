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
}
