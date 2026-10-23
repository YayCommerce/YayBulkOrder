<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$product_id = absint( $block->context['yay-bulk-order/productId'] ?? get_the_ID() );
$product    = wc_get_product( $product_id );

$is_selectable = $product instanceof WC_Product && $product->supports( 'ajax_add_to_cart' );
?>

<td
    <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
>
    <?php if ( $is_selectable ) : ?>
        <input
            type="checkbox"
            data-wp-bind--checked="state.isRowSelected"
            data-wp-on--change="actions.toggleSelectRow"
            data-wp-bind--hidden="state.isAddToCartDisabled"
            aria-label="<?php echo esc_attr__( 'Select product', 'yay-bulk-order' ); ?>"
        />
    <?php endif; ?>
</td>
