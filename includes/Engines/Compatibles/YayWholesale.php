<?php
namespace YayBulkOrder\Engines\Compatibles;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Compatibility adapter for Yay Wholesale B2B.
 *
 * @method static YayWholesale get_instance()
 */
class YayWholesale {
    use SingletonTrait;

    protected function __construct() {
        if ( ! class_exists( '\YayWholesaleB2B\Helpers\CustomerHelper' ) ) {
            return;
        }

        add_action( 'yaybulkorder_adjust_raw_price', [ $this, 'adjust_raw_price' ], 10, 2 );

        add_filter( 'woocommerce_is_purchasable', [ $this, 'fix_variation_purchasable' ], 20, 2 );

        add_filter( 'yaybulkorder_purchase_list_product_price', [ $this, 'calculate_wholesale_price' ], 100, 2 );
    }

    public function adjust_raw_price( \WC_Product $product, int $quantity = 1 ): void {
        $role = \YayWholesaleB2B\Helpers\CustomerHelper::get_current_user_wholesale_role();
        if ( ! $role ) {
            return;
        }

        $wholesale_price = $this->calculate_wholesale_raw_price( $product, $role, $quantity );
        if ( null === $wholesale_price ) {
            return;
        }

        $product->set_regular_price( $wholesale_price );
        $product->set_sale_price( $wholesale_price );
        $product->set_price( $wholesale_price );
    }

    private function calculate_wholesale_raw_price( \WC_Product $product, array $role, int $quantity ): ?float {
        $regular_price = (float) $product->get_regular_price( 'edit' );
        $current_price = (float) $product->get_price( 'edit' );

        $before_discount_price = ( ! empty( $role['applyToSalePrice'] ) && $current_price > 0.0 && $current_price < $regular_price )
            ? $current_price
            : $regular_price;

        if ( $before_discount_price <= 0.0 ) {
            return null;
        }

        $discount        = isset( $role['discount'] ) ? ( (float) $role['discount'] / 100 ) : 0.0;
        $wholesale_price = $discount > 0 ? max( 0.0, $before_discount_price * ( 1 - $discount ) ) : $before_discount_price;

        // Keep any site-specific customization of the wholesale price formula in sync.
        return (float) apply_filters( 'ywhs_calculate_wholesale_product_price', $wholesale_price, $before_discount_price, $product, $role, $quantity );
    }

    public function fix_variation_purchasable( bool $purchasable, \WC_Product $product ): bool {
        if ( $purchasable || ! $product instanceof \WC_Product_Variation ) {
            return $purchasable;
        }

        if ( ! class_exists( '\YayWholesaleB2B\Pro\Helpers\AccessHelpers\CategoryAccessHelper' ) ) {
            return $purchasable;
        }

        $parent = wc_get_product( $product->get_parent_id() );
        if ( ! $parent instanceof \WC_Product ) {
            return $purchasable;
        }

        $role = \YayWholesaleB2B\Helpers\CustomerHelper::get_current_user_wholesale_role();

        $accessible_by_category = \YayWholesaleB2B\Pro\Helpers\AccessHelpers\CategoryAccessHelper::is_accessible_product_by_categories( $parent, $role );
        if ( ! $accessible_by_category ) {
            return false;
        }

        return $product->exists()
            && ( 'publish' === $product->get_status() || current_user_can( 'edit_post', $product->get_id() ) )
            && '' !== $product->get_price();
    }

    public function calculate_wholesale_price( float $price, \WC_Product $product ): float {
        $role = \YayWholesaleB2B\Helpers\CustomerHelper::get_current_user_wholesale_role();
        if ( ! $role ) {
            return $price;
        }

        $regular_price = (float) $product->get_regular_price( 'edit' );
        $current_price = (float) $product->get_price( 'edit' );
        if ( $current_price <= 0.0 ) {
            return $price;
        }

        $wholesale_price = $this->calculate_wholesale_raw_price( $product, $role, 1 );
        if ( null === $wholesale_price ) {
            return $price;
        }

        // $price is already display-currency; scale it by the wholesale discount ratio
        // (computed in raw currency, so the ratio itself is currency-agnostic) instead of
        // substituting Wholesale's raw amount directly.
        return $price * ( $wholesale_price / $current_price );
    }
}
