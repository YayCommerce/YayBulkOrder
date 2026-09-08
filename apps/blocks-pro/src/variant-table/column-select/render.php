<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

$variation_id = absint( $block->context['yay-bulk-order/productId'] ?? 0 );
$variation    = $variation_id ? wc_get_product( $variation_id ) : null;

$is_selectable = $variation instanceof WC_Product && $variation->is_purchasable();
?>

<td
    <?php echo get_block_wrapper_attributes(); ?>
>
    <?php if ( $is_selectable ) : ?>
        <input
            type="checkbox"
            data-wp-bind--checked="state.isRowSelected"
            data-wp-on--change="actions.toggleSelectRow"
            aria-label="<?php echo esc_attr__( 'Select variation', 'yay-bulk-order' ); ?>"
        />
    <?php endif; ?>
</td>
