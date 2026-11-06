<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use YayBulkOrder\Services\ProductQueryService;
use YayBulkOrder\Services\LocalizeService;
use YayBulkOrder\Services\PricingService;
use YayBulkOrder\Services\VariationAttributeService;
use YayBulkOrder\Utils\BlockHelper;

$product_query_service = ProductQueryService::get_instance();
$localize_service = LocalizeService::get_instance();
$global_config = $localize_service->get_global_config();
$default_cart_quantity = $global_config['settings']['general']['defaultCartQuantity'];
$query = $product_query_service->create_products_query( $block );

$cart_quantities = isset( WC()->cart ) && WC()->cart ? WC()->cart->get_cart_item_quantities() : array();

$render_row = function ( $block, $product_id, $product, $default_cart_quantity, $cart_quantities, $parent_product_id, $parent_product = null ) {
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
        // Also used as the +/- stepper's increment (matches the input's own `step` attribute).
        'quantityStep'   => (int) $default_cart_quantity,
        'unitPrice'      => $unit_price,
        // A price of 0 is still a valid, purchasable price — only an
        // unpurchasable product (no price set, unpublished, ...) should
        // disable add-to-cart / the select checkbox.
        'isPurchasable'  => $product->is_purchasable(),
        'productType'    => $product_type,
        'isAddingToCart' => false,
        'addToCartText'  => $add_to_cart_text,
        'cartQuantity'   => $cart_quantity,
    );
    if ( $parent_product_id ) {
        $row_context['parentProductId'] = $parent_product_id;
    }
    if ( $parent_product_id && $product instanceof WC_Product_Variation && $parent_product instanceof WC_Product_Variable ) {
        $variation_selections = VariationAttributeService::get_instance()->get_variation_selections( $product, $parent_product );
        if ( ! empty( $variation_selections ) ) {
            $row_context['variationSelections'] = $variation_selections;
        }
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
    <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
>
<?php

if ( ! $query->have_posts() ) {
    echo '<tr><td colspan="999">' . esc_html__( 'No products found', 'yay-bulk-order' ) . '</td></tr>';
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
            $max_display = defined( 'YAYBULKORDER_MAX_VARIATION_IN_ROW' ) ? YAYBULKORDER_MAX_VARIATION_IN_ROW : 20;
            $children    = $product->get_visible_children();
            $display_ids = array_slice( $children, 0, $max_display );

            _prime_post_caches( $display_ids );

            foreach ( $display_ids as $variation_id ) {
                $variation = wc_get_product( $variation_id );
                if ( ! $variation instanceof WC_Product_Variation || ! $variation->exists() || ! $variation->variation_is_visible() ) {
                    continue;
                }
                $table_body_content .= $render_row( $block, $variation->get_id(), $variation, $default_cart_quantity, $cart_quantities, $product_id, $product );
            }

            if ( count( $children ) > $max_display ) {
                $table_body_content .= sprintf(
                    '<tr class="yay-bulk-order-table-template-row--variation" %s data-wp-bind--hidden="state.isVariationRowHidden"><td colspan="999"><a href="%s">%s</a></td></tr>',
                    wp_interactivity_data_wp_context( array( 'parentProductId' => $product_id ) ),
                    esc_url( $product->get_permalink() ),
                    esc_html__( 'View more options...', 'yay-bulk-order' )
                );
            }
        }
    }

    // end row loop
    wp_reset_postdata();
    echo wp_kses( $table_body_content, BlockHelper::get_table_row_allowed_html() );
}

?>
</tbody>
