<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Resolves the price to display for a product row.
 * Some third-party pricing plugins (e.g. Yay Wholesale B2B, YayPricing,...)
 *
 * @method static PricingService get_instance()
 */
class PricingService {
    use SingletonTrait;

    public function get_display_unit_price( \WC_Product $product, int $quantity = 1 ): float {
        $quantity = max( 1, $quantity );

        if ( $product instanceof \WC_Product_Variable ) {
            // Handlers can change the price of each variation. Without them, use the WooCommerce cached prices.
            if ( ! has_action( 'yaybulkorder_adjust_raw_price' ) ) {
                return (float) $product->get_variation_price( 'min' );
            }

            $prices = [];
            foreach ( $product->get_children() as $variation_id ) {
                $variation = wc_get_product( $variation_id );
                if ( ! $variation instanceof \WC_Product_Variation || ! $variation->exists() ) {
                    continue;
                }
                $prices[] = $this->get_display_unit_price( $variation, $quantity );
            }
            return empty( $prices ) ? 0.0 : (float) min( $prices );
        }

        // Handlers change the price on the product they receive, so they get a copy.
        // Cloning reads the product meta, so skip it when no handler can change the price.
        if ( has_action( 'yaybulkorder_adjust_raw_price' ) ) {
            $clone = clone $product;
            do_action( 'yaybulkorder_adjust_raw_price', $clone, $quantity );

            $raw_price = (float) $clone->get_price( 'edit' );
        } else {
            $raw_price = (float) $product->get_price( 'edit' );
        }

        return (float) apply_filters( 'woocommerce_product_get_price', $raw_price, $product );
    }
}
