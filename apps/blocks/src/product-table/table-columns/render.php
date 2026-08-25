<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

use YayBulkOrder\Services\ProductQueryService;
use YayBulkOrder\Services\LocalizeService;

$product_query_service = ProductQueryService::get_instance();
$localize_service = LocalizeService::get_instance();
$global_config = $localize_service->get_global_config();
$default_cart_quantity = $global_config['settings']['general']['defaultCartQuantity'];
$query_vars = $product_query_service->build_query_vars_from_query_block( $block );
$page_param = $product_query_service->get_page_param( $block );
$filter_param = $product_query_service->get_filter_param( $block );
$query = new \WP_Query( $query_vars );

$cart_quantities = isset( WC()->cart ) && WC()->cart ? WC()->cart->get_cart_item_quantities() : array();

?>

<tbody
    <?php echo get_block_wrapper_attributes(); ?>
>
<?php

if ( ! $query->have_posts() ) {
    echo '<tr><td colspan="999">No products found</td></tr>';
}

if ( $query->have_posts() ) {
    $table_body_content = '';

    while ( $query->have_posts() ) {
        $query->the_post();
        $product_id     = get_the_ID();
        $product    = wc_get_product( $product_id );

        if ( ! $product ) {
            continue;
        }
        /** Disable all block features of the row placeholder */
        $block_instance = $block->parsed_block;
        $block_instance['blockName'] = 'core/null';

        $available_context = array_merge(
            (array) $block->context,
            array(
                'yay-bulk-order/productId'   => $product_id,
            )
        );

        $single_row_content = (
            new WP_Block(
                $block_instance,
                $available_context
            )
        )->render( array( 'dynamic' => false ) );

        $cart_quantity = isset( $cart_quantities[ $product_id ] ) ? (int) $cart_quantities[ $product_id ] : 0;
        $add_to_cart_text = $product->add_to_cart_text() ? $product->add_to_cart_text() : __( 'Add to cart', 'yay-bulk-order' );
        if ( $product instanceof WC_Product_Variable ) {
            $unit_price = (float) $product->get_variation_price( 'min', true );
        } else {
            $unit_price = (float) wc_get_price_to_display( $product );
        }
        $row_html = '<tr class="{classes}" {rowContext}>
                        {content}
                    </tr>';
        $row_classes = 'yay-bulk-order-table-template-row';
        $row_context = wp_interactivity_data_wp_context( [
            'productId'      => $product_id,
            'variantId'      => 0,
            'quantity'       => $default_cart_quantity,
            'unitPrice'      => $unit_price,
            'productType'    => $product->get_type(),
            'isAddingToCart' => false,
            'addToCartText'  => $add_to_cart_text,
            'cartQuantity'   => $cart_quantity,
        ] );

        $table_body_content .= strtr(
            $row_html,
            array(
                '{classes}'       => esc_attr( $row_classes ),
                '{rowContext}'    => $row_context,
                '{content}'       => $single_row_content,
            )
        );
    }

    // end row loop
    wp_reset_postdata();
    echo $table_body_content;
}

?>
</tbody>
