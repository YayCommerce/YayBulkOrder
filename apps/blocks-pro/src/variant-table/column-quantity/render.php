<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */
?>

<td
    <?php echo get_block_wrapper_attributes(); ?>
>
    <input
        class="ybo-quantity-input"
        type="number"
        min="1"
        step="1"
        data-wp-bind--value="context.quantity"
        data-wp-on--input="actions.updateQuantity"
        aria-label="<?php echo esc_attr__( 'Quantity', 'yay-bulk-order' ); ?>"
    />
</td>
