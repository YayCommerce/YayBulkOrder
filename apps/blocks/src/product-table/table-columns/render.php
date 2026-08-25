<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

use YayBulkOrder\Services\ProductQueryService;
use YayBulkOrder\Services\LocalizeService;
use YayBulkOrder\Services\PricingService;

$product_query_service = ProductQueryService::get_instance();
$localize_service = LocalizeService::get_instance();
$global_config = $localize_service->get_global_config();
$default_cart_quantity = $global_config['settings']['general']['defaultCartQuantity'];
$query = $product_query_service->create_products_query( $block );

$cart_quantities = isset( WC()->cart ) && WC()->cart ? WC()->cart->get_cart_item_quantities() : array();

$render_row = function ( $block, $product_id, $product, $default_cart_quantity, $cart_quantities, $parent_product_id ) {
    $block_instance = $block->parsed_block;
    $block_instance['blockName'] = 'core/null';

    $available_context = array_merge(
        (array) $block->context,
        array(
            'yay-bulk-order/productId' => $product_id,
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
    $unit_price = PricingService::get_instance()->get_display_unit_price( $product, (int) $default_cart_quantity );

    $product_type = $parent_product_id ? 'simple' : $product->get_type();

    $row_html = '<tr class="{classes}" {rowContext} data-wp-key="{key}" {hidden}{expandedClass}data-wp-watch="callbacks.syncCartQuantityFromExternalChange">
                    {content}
                </tr>';
    $row_classes = 'yay-bulk-order-table-template-row';
    if ( $parent_product_id ) {
        $row_classes .= ' yay-bulk-order-table-template-row--variation';
    }

    $row_context = array(
        'productId'      => $product_id,
        'variantId'      => $parent_product_id ? $product_id : 0,
        'quantity'       => $default_cart_quantity,
        'unitPrice'      => $unit_price,
        'productType'    => $product_type,
        'isAddingToCart' => false,
        'addToCartText'  => $add_to_cart_text,
        'cartQuantity'   => $cart_quantity,
    );
    if ( $parent_product_id ) {
        $row_context['parentProductId'] = $parent_product_id;
    }

    return strtr(
        $row_html,
        array(
            '{classes}'    => esc_attr( $row_classes ),
            '{rowContext}' => wp_interactivity_data_wp_context( $row_context ),
            '{key}'        => esc_attr( $product_id ),
            // Variation rows start collapsed; toggled by
            // actions.toggleProductVariations() on the parent's row.
            '{hidden}'     => $parent_product_id ? 'data-wp-bind--hidden="state.isVariationRowHidden" ' : '',
            // On the parent row only: marks it while its variations are
            // showing, so the two visually merge into one group (see CSS).
            '{expandedClass}' => $product instanceof WC_Product_Variable ? 'data-wp-class--is-expanded="state.isProductExpanded" ' : '',
            '{content}'    => $single_row_content,
        )
    );
};

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

        $table_body_content .= $render_row( $block, $product_id, $product, $default_cart_quantity, $cart_quantities, null );

        if ( $product instanceof WC_Product_Variable ) {
            foreach ( $product->get_available_variations( 'objects' ) as $variation ) {
                if ( ! $variation instanceof WC_Product_Variation || ! $variation->exists() ) {
                    continue;
                }
                $table_body_content .= $render_row( $block, $variation->get_id(), $variation, $default_cart_quantity, $cart_quantities, $product_id );
            }
        }
    }

    // end row loop
    wp_reset_postdata();
    echo $table_body_content;
}

?>
</tbody>
