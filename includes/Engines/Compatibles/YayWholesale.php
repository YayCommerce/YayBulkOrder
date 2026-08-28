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
        if (
            ! class_exists( '\YayWholesaleB2B\Helpers\CustomerHelper' ) ||
            ! class_exists( '\YayWholesaleB2B\Helpers\PricingHelpers\ShopPricingHelper' )
        ) {
            return;
        }

        add_filter( 'yaybulkorder_product_display_price', [ $this, 'adjust_price' ], 10, 2 );

        add_filter( 'woocommerce_is_purchasable', [ $this, 'fix_variation_purchasable' ], 20, 2 );

        add_filter( 'yaybulkorder_purchase_list_product_price', [ $this, 'calculate_wholesale_price' ], 100, 2 );
    }

    public function adjust_price( float $price, \WC_Product $product ): float {
        $role = \YayWholesaleB2B\Helpers\CustomerHelper::get_current_user_wholesale_role();
        if ( ! $role ) {
            return $price;
        }

        if ( $product instanceof \WC_Product_Variable ) {
            $discounted = \YayWholesaleB2B\Helpers\PricingHelpers\ShopPricingHelper::get_wholesale_prices_display_from_variants( $product, $role );
            return empty( $discounted ) ? $price : (float) min( $discounted );
        }

        return (float) \YayWholesaleB2B\Helpers\PricingHelpers\ShopPricingHelper::get_wholesale_price_for_display( $product, $role );
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

    public function calculate_wholesale_price( $price, \WC_Product $product ) {
        $wholesale_role = \YayWholesaleB2B\Helpers\CustomerHelper::get_current_user_wholesale_role();
        if ( empty( $wholesale_role ) ) {
            return $price;
        }

        return \YayWholesaleB2B\Helpers\PricingHelpers\ShopPricingHelper::get_wholesale_price_for_display( $product, $wholesale_role );
    }
}
