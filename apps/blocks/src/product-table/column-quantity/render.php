<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use YayBulkOrder\Services\LocalizeService;

$localize_service = LocalizeService::get_instance();
$global_config = $localize_service->get_global_config();
$default_cart_quantity = $global_config['settings']['general']['defaultCartQuantity'];

?>

<td
    <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    data-wp-class--ybo-quantity-placeholder="state.isNotSimpleProduct"
>
    <div class="ybo-quantity-stepper" data-wp-bind--hidden="state.isNotSimpleProduct">
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
            step="<?php echo esc_attr($default_cart_quantity); ?>"
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
    <span data-wp-bind--hidden="!state.isNotSimpleProduct" aria-hidden="true">—</span>
</td>