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
        if ( $product instanceof \WC_Product_Variable ) {
            $price = (float) $product->get_variation_price( 'min', true );
        } else {
            $price = (float) wc_get_price_to_display( $product );
        }

        return (float) apply_filters( 'yaybulkorder_product_display_price', $price, $product, max( 1, $quantity ) );
    }
}
