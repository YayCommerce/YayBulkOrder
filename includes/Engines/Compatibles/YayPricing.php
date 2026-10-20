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

        add_action( 'yaybulkorder_adjust_raw_price', [ $this, 'adjust_raw_price' ], 20, 2 );
    }

    public function adjust_raw_price( \WC_Product $product, int $quantity = 1 ): void {
        try {
            $cart = new \YAYDP\Core\YAYDP_Cart( [] );
            // Explicit [] keeps this isolated from the real WC()->cart.
            $cart->add_item( $product, $quantity );

            ( new \YAYDP\Core\Adjustments\YAYDP_Product_Pricing_Adjustments( $cart ) )->do_stuff();

            foreach ( $cart->get_items() as $item ) {
                $new_price = max( 0.0, (float) $item->get_price() );
                $product->set_regular_price( $new_price );
                $product->set_sale_price( $new_price );
                $product->set_price( $new_price );
                return;
            }
        } catch ( \Throwable $error ) {
            // Never let a YayPricing internal error break the Product Table — leave $product's
            // price as whatever ran before this.
            return;
        }
    }
}
