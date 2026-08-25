<?php
namespace YayBulkOrder\Engines\Compatibles\YayWholesale;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * YayWholesale Compatible
 */
class YayWholesale {
    use SingletonTrait;

    protected function __construct() {
        if ( ! defined( 'YAYWHOLESALEB2B_VERSION' ) ) {
            return;
        }

        add_filter( 'ybo_purchase_list_product_price', [ $this, 'calculate_wholesale_price' ], 100, 2 );
    }

    public function calculate_wholesale_price( $price, \WC_Product $product ) {
        $wholesale_role = \YayWholesaleB2B\Helpers\CustomerHelper::get_current_user_wholesale_role();
        if ( empty( $wholesale_role ) ) {
            return $price;
        }

        return \YayWholesaleB2B\Helpers\PricingHelpers\ShopPricingHelper::get_wholesale_price_for_display( $product, $wholesale_role );
    }
}
