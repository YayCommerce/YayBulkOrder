<?php
namespace YayBulkOrder\Engines\Frontend;

use YayBulkOrder\Services\ProductTablesService;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Store Page engine
 */
class StorePage {
    use SingletonTrait;

    private ProductTablesService $product_tables_service;

    private bool $is_buffering_shop_loop = false;

    protected function __construct() {
        $this->product_tables_service = ProductTablesService::get_instance();

        // Store page (Classic theme)
        add_action( 'woocommerce_before_shop_loop', [ $this, 'maybe_start_shop_table_buffer' ], 1 );
        add_action( 'woocommerce_after_shop_loop', [ $this, 'maybe_replace_shop_loop' ], PHP_INT_MAX );
    }

    /**
     * Start buffering the default UI of shop.
     */
    public function maybe_start_shop_table_buffer(): void {
        $is_prevent_apply = apply_filters( 'ybo_shop_page_prevent_apply_template', false );

        if ( $is_prevent_apply ) {
            return;
        }

        if ( ! $this->product_tables_service->is_applied_table_to_shop() ) {
            return;
        }

        $this->is_buffering_shop_loop = true;
        ob_start();
    }

    /**
     * Render the product table to the shop page.
     */
    public function maybe_replace_shop_loop(): void {
        $is_prevent_apply = apply_filters( 'ybo_shop_page_prevent_apply_template', false );

        if ( $is_prevent_apply ) {
            return;
        }

        if ( ! $this->is_buffering_shop_loop ) {
            return;
        }

        $this->is_buffering_shop_loop = false;
        ob_end_clean();

        $table_id = (int) $this->product_tables_service->get_shop_page_product_table();
        echo do_shortcode( '[ybo-product-table id="' . $table_id . '"]' );
    }
}
