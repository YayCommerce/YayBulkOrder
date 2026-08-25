<?php
namespace YayBulkOrder\Pro\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Quick add to cart by csv
 *
 * @method static CSVOrderService get_instance()
 */
class CSVOrderService {
    use SingletonTrait;

    public const CSV_ORDER_RECENT_LOG = 'ybo_csv_order_recent_logs';

    public function quick_csv_add_to_cart( string $filename ) {
        $logs = [
            'success' => 0,
            'failed'  => [],
        ];

        if ( ! file_exists( $filename ) ) {
            $logs['failed'][] = __( 'The CSV file could not be found.', 'yay-bulk-order' );
            return $logs;
        }

        global $wp_filesystem;

        if ( ! $wp_filesystem ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        $csv_content = $wp_filesystem->get_contents( $filename );

        if ( false === $csv_content ) {
            $logs['failed'][] = __( 'The CSV file could not be read.', 'yay-bulk-order' );
            return $logs;
        }

        $rows = array_map( fn( $row ) => '' === $row ? [] : str_getcsv( $row, ',', '"', '\\' ), preg_split( "/\r\n|\n|\r/", $csv_content ) );
        array_shift( $rows );

        foreach ( $rows as $index => $row ) {
            if ( empty( $row ) ) {
                // translators: %d: the row number
                $logs['failed'][] = sprintf( __( 'Row %d: This row is empty and was skipped.', 'yay-bulk-order' ), $index + 2 );
                continue;
            }

            $sku        = $row[0];
            $product_id = wc_get_product_id_by_sku( $sku );
            if ( empty( $product_id ) ) {
                // translators: %1$d: the row number, %2$s: the sku
                $logs['failed'][] = sprintf( __( 'Row %1$d: No matching product was found with the SKU: %2$s.', 'yay-bulk-order' ), $index + 2, $sku );
                continue;
            }

            $product = wc_get_product( $product_id );
            if ( empty( $product ) ) {
                // translators: %1$d: the row number, %2$s: the sku
                $logs['failed'][] = sprintf( __( 'Row %1$d: No matching product was found with the SKU: %2$s.', 'yay-bulk-order' ), $index + 2, $sku );
                continue;
            }

            $is_purchasable = apply_filters( 'ybo_csv_order_product_is_purchasable', $product->is_purchasable() || $product->is_type( 'grouped' ), $product );

            if ( ! $is_purchasable ) {
                // translators: %d: the row number
                $logs['failed'][] = sprintf( __( 'Row %d: this product is not purchasable.', 'yay-bulk-order' ), $index + 2 );
                continue;
            }

            if ( ! array_key_exists( 1, $row ) ) {
                // translators: %d: the row number
                $logs['failed'][] = sprintf( __( 'Row %d: No quantity is found for this product.', 'yay-bulk-order' ), $index + 2 );
                continue;
            }

            $quantity = intval( $row[1] ?? '0' );
            if ( $quantity > 0 ) {
                if ( $product->get_type() === 'variation' ) {
                    $added = WC()->cart->add_to_cart( $product->get_parent_id(), $quantity, $product->get_id() );

                    if ( $added ) {
                        ++$logs['success'];
                    }
                } elseif ( $product->get_type() === 'grouped' ) {
                    foreach ( $product->get_children() as $child_id ) {
                        $added = WC()->cart->add_to_cart( $child_id, $quantity );
                        if ( $added ) {
                            ++$logs['success'];
                        }
                    }
                } else {
                    $added = WC()->cart->add_to_cart( $product->get_id(), $quantity );
                    if ( $added ) {
                        ++$logs['success'];
                    }
                }
            }//end if
        }//end foreach

        return $logs;
    }
}
