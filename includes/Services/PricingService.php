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

        $clone = clone $product;
        do_action( 'yaybulkorder_adjust_raw_price', $clone, $quantity );

        $raw_price = (float) $clone->get_price( 'edit' );

        return (float) apply_filters( 'woocommerce_product_get_price', $raw_price, $product );
    }
}
