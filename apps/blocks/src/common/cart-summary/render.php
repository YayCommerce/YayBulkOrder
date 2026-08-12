<?php
if ( ! function_exists( 'WC' ) ) {
	return;
}
?>

<!-- Hidden Woo Mini Cart (mount React + store) -->
<div style="display:none">
	<?php echo do_blocks( '<!-- wp:woocommerce/mini-cart /-->' ); ?>
</div>

<div
	<?php echo get_block_wrapper_attributes(); ?>
	data-wp-interactive="yay-bulk-order/cart-summary"
	data-wp-init="callbacks.init"
>
	<button
		type="button"
		data-wp-on--click="woocommerce/mini-cart::actions.openDrawer"
		aria-label="<?php esc_attr_e( 'Open cart', 'yay-bulk-order' ); ?>"
		title="<?php esc_attr_e( 'Open cart', 'yay-bulk-order' ); ?>"
		data-wp-class--is-empty="state.isEmpty"
	>
		<span class="yay-cart-trigger__icon" aria-hidden="true">🛒</span>

		<span
			class="yay-cart-trigger__subtotal"
			data-wp-text="state.subtotal"
		></span>

		<span
			class="yay-cart-trigger__count"
			data-wp-text="state.itemCountLabel"
			data-wp-bind--hidden="state.isEmpty"
		></span>
	</button>
</div>
