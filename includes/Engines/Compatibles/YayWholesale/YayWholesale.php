<?php
namespace YayBulkOrder\Engines\Compatibles\YayWholesale;

use YayBulkOrder\Services\ProductTablesService;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Compatibility adapter for Yay Wholesale B2B.
 *
 * @method static YayWholesale get_instance()
 */
class YayWholesale {
    use SingletonTrait;

    private bool $is_buffering_shop_loop;
    private ProductTablesService $product_tables_service;

    protected function __construct() {
        if ( ! class_exists( '\YayWholesaleB2B\Helpers\CustomerHelper' ) ) {
            return;
        }
        $this->product_tables_service = ProductTablesService::get_instance();

        add_action( 'yaybulkorder_adjust_raw_price', [ $this, 'adjust_raw_price' ], 10, 2 );

        add_filter( 'woocommerce_is_purchasable', [ $this, 'fix_variation_purchasable' ], 20, 2 );

        add_filter( 'yaybulkorder_purchase_list_product_price', [ $this, 'calculate_wholesale_price' ], 100, 2 );

        add_filter( 'yaybulkorder_shop_page_prevent_apply_template', [ $this, 'prevent_apply_template_for_pro' ] );

        add_filter( 'ywhs_classic_shop_template_list', [ $this, 'add_ybo_product_table_template' ] );

        add_action( 'ywhs_ybo_before_shop_loop', [ $this, 'before_template_woocommerce_loop' ] );

        add_action( 'ywhs_ybo_after_shop_loop', [ $this, 'after_template_woocommerce_loop' ] );

        add_filter( 'yaybulkorder_product_query_vars', [ $this, 'exclude_ids_product_query' ] );
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

    public function prevent_apply_template_for_pro() {
        return class_exists( 'YayWholesaleB2B\Pro\YayWholesaleB2BPro', true );
    }

    public function add_ybo_product_table_template( array $templates ) {
        $templates[] = [
            'slug' => 'ybo_product_table',
            'name' => 'Yay Bulk Order Template',
            'path' => YAYBULKORDER_PLUGIN_PATH . 'includes/Engines/Compatibles/YayWholesale/templates/product-table-shop.php',
        ];
        return $templates;
    }

    public function before_template_woocommerce_loop() {
        $this->is_buffering_shop_loop = true;
        ob_start();
    }

    public function after_template_woocommerce_loop() {
        $this->is_buffering_shop_loop = false;
        ob_end_clean();

        $table_id = $this->product_tables_service->get_shop_page_product_table();
        if ( $table_id > 0 ) {
            echo do_shortcode( '[ybo-product-table id="' . $table_id . '"]' );
        } else {
            echo do_shortcode( '[ybo-product-table]' );
        }
    }

    public function exclude_ids_product_query( array $query_vars ) {
        if ( ! class_exists( 'YayWholesaleB2B\Pro\Helpers\AccessHelpers\ProductAccessHelper' ) ||
        ! class_exists( 'YayWholesaleB2B\Pro\Helpers\AccessHelpers\CategoryAccessHelper' ) ) {
            return $query_vars;
        }

        $wholesale_role = \YayWholesaleB2B\Helpers\CustomerHelper::get_current_user_wholesale_role();

        // All products id that is blocked (products and variations)
        $general_hidden_product_ids = \YayWholesaleB2B\Pro\Helpers\AccessHelpers\ProductAccessHelper::get_blocked_product_ids( $wholesale_role );
        // Variable and Grouped Product ids (if all the children are blocked, then blocked the parent too)
        $product_with_all_children_hidden_ids = \YayWholesaleB2B\Pro\Helpers\AccessHelpers\ProductAccessHelper::get_blocked_product_with_children_ids( $general_hidden_product_ids );
        // Blocked Product IDs
        $hidden_ids = array_merge( $general_hidden_product_ids, $product_with_all_children_hidden_ids );

        if ( array_key_exists( 'post__in', $query_vars ) ) {
            $query_vars['post__in'] = array_filter( $query_vars['post__in'], fn( $id ) => ! in_array( $id, $hidden_ids, true ) );
        } else {
            $query_vars['post__not_in'] = $hidden_ids;
        }

        $excluded_category_ids = \YayWholesaleB2B\Pro\Helpers\AccessHelpers\CategoryAccessHelper::get_excluded_categories( $wholesale_role );

        if ( ! empty( $excluded_category_ids ) ) {
            $tax_query   = $query_vars['tax_query'] ?? [];
            $tax_query[] = [
                'taxonomy' => 'product_cat',
                'field'    => 'term_id',
                'terms'    => $excluded_category_ids,
                'operator' => 'NOT IN',
            ];

            $query_vars['tax_query'] = $tax_query;
        }

        return $query_vars;
    }
}
