<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

use YayBulkOrder\Pro\Services\VariantTableService;
use YayBulkOrder\Services\PricingService;
use YayBulkOrder\Services\VariationAttributeService;

$product = VariantTableService::get_instance()->resolve_product( $block->context );

$cart_quantities = isset( WC()->cart ) && WC()->cart ? WC()->cart->get_cart_item_quantities() : array();

$render_row = function ( $block, $variation, $parent_product, $cart_quantities ) {
    $block_instance = $block->parsed_block;
    $block_instance['blockName'] = 'core/null';

    $variation_id = $variation->get_id();

    $available_context = array_merge(
        (array) $block->context,
        array(
            'yay-bulk-order/productId' => $variation_id,
        )
    );

    $single_row_content = (
        new WP_Block(
            $block_instance,
            $available_context
        )
    )->render( array( 'dynamic' => false ) );

    $cart_quantity = isset( $cart_quantities[ $variation_id ] ) ? (int) $cart_quantities[ $variation_id ] : 0;
    // A row always starts at quantity 1, regardless of the plugin's default
    // cart quantity setting — the Variant Table block's own convention.
    $unit_price = PricingService::get_instance()->get_display_unit_price( $variation, 1 );

    $row_context = array(
        'variationId'  => $variation_id,
        'quantity'     => 1,
        // Matches the row's own "always starts at 1" convention above.
        'quantityStep' => 1,
        'unitPrice'    => $unit_price,
        'cartQuantity' => $cart_quantity,
    );

    if ( $parent_product instanceof WC_Product_Variable ) {
        $variation_selections = VariationAttributeService::get_instance()->get_variation_selections( $variation, $parent_product );
        if ( ! empty( $variation_selections ) ) {
            $row_context['variationSelections'] = $variation_selections;
        }
    }

    return strtr(
        '<tr class="yay-bulk-order-variant-table-row" {rowContext} data-wp-key="{key}" data-wp-watch="callbacks.syncCartQuantityFromExternalChange">{content}</tr>',
        array(
            '{rowContext}' => wp_interactivity_data_wp_context( $row_context ),
            '{key}'        => esc_attr( $variation_id ),
            '{content}'    => $single_row_content,
        )
    );
};

?>

<tbody
    <?php echo get_block_wrapper_attributes(); ?>
>
<?php

if ( ! $product instanceof WC_Product_Variable ) {
    echo '<tr><td colspan="999">' . esc_html__( 'No variations found', 'yay-bulk-order' ) . '</td></tr>';
} else {
    $table_body_content = '';

    foreach ( $product->get_available_variations( 'objects' ) as $variation ) {
        if ( ! $variation instanceof WC_Product_Variation || ! $variation->exists() ) {
            continue;
        }
        $table_body_content .= $render_row( $block, $variation, $product, $cart_quantities );
    }

    echo $table_body_content ? $table_body_content : '<tr><td colspan="999">' . esc_html__( 'No variations found', 'yay-bulk-order' ) . '</td></tr>';
}

?>
</tbody>
