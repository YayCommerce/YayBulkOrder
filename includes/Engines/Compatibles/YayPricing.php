<?php
namespace YayBulkOrder\Engines\Compatibles;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Compatibility adapter for YayPricing
 *
 * @method static YayPricing get_instance()
 */
class YayPricing {
    use SingletonTrait;

    protected function __construct() {
        if (
            ! class_exists( '\YAYDP\Core\YAYDP_Cart' ) ||
            ! class_exists( '\YAYDP\Core\Adjustments\YAYDP_Product_Pricing_Adjustments' )
        ) {
            return;
        }

        add_filter( 'yaybulkorder_product_display_price', [ $this, 'adjust_price' ], 20, 3 );
    }

    public function adjust_price( float $price, \WC_Product $product, int $quantity = 1 ): float {
        $quantity = max( 1, $quantity );

        try {
            if ( $product instanceof \WC_Product_Variable ) {
                $variation_prices = [];
                foreach ( $product->get_children() as $variation_id ) {
                    $variation = wc_get_product( $variation_id );
                    if ( ! $variation instanceof \WC_Product ) {
                        continue;
                    }

                    $variation_prices[] = $this->calculate_price_for_quantity( $variation, $quantity, $price );
                }
                return empty( $variation_prices ) ? $price : (float) min( $variation_prices );
            }

            return $this->calculate_price_for_quantity( $product, $quantity, $price );
        } catch ( \Throwable $error ) {
            // Never let a YayPricing internal error break the Product Table.
            return $price;
        }//end try
    }

    private function calculate_price_for_quantity( \WC_Product $product, int $quantity, float $base_price ): float {
        $cart = new \YAYDP\Core\YAYDP_Cart( [] );
        // Explicit [] keeps this isolated from the real WC()->cart.
        $cart->add_item( $this->product_with_overridden_price( $product, $base_price ), $quantity );

        ( new \YAYDP\Core\Adjustments\YAYDP_Product_Pricing_Adjustments( $cart ) )->do_stuff();

        foreach ( $cart->get_items() as $item ) {
            return (float) $item->get_price();
        }

        return $base_price;
    }

    private function product_with_overridden_price( \WC_Product $product, float $price ): \WC_Product {
        $clone = clone $product;
        $clone->set_regular_price( $price );
        $clone->set_sale_price( '' );
        return $clone;
    }
}
