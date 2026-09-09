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
    <div class="ybo-quantity-stepper">
        <button
            type="button"
            class="ybo-quantity-stepper__button ybo-quantity-stepper__button--minus"
            data-wp-on--click="actions.decrementQuantity"
            aria-label="<?php echo esc_attr__( 'Decrease quantity', 'yay-bulk-order' ); ?>"
        >−</button>
        <input
            class="ybo-quantity-input"
            type="number"
            min="1"
            step="1"
            data-wp-bind--value="context.quantity"
            data-wp-on--input="actions.updateQuantity"
            aria-label="<?php echo esc_attr__( 'Quantity', 'yay-bulk-order' ); ?>"
        />
        <button
            type="button"
            class="ybo-quantity-stepper__button ybo-quantity-stepper__button--plus"
            data-wp-on--click="actions.incrementQuantity"
            aria-label="<?php echo esc_attr__( 'Increase quantity', 'yay-bulk-order' ); ?>"
        >+</button>
    </div>
</td>
