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
	class="wp-block-yay-bulk-order-cart-trigger"
	style="margin:30px 0;"
	data-wp-interactive="yay-bulk-order/cart-summary"
	data-wp-context='{"isOpen": false, "itemCount": 0, "subtotal": ""}'
	data-wp-init="callbacks.init"
>
	<button
		type="button"
		data-wp-on--click="actions.openMiniCart"
		data-wp-bind--aria-label="state.buttonText"
		data-wp-bind--title="state.buttonText"
	>
		<span class="yay-cart-trigger__icon">
			<?php echo esc_html__( 'Your Cart', 'yay-bulk-order' ); ?>
		</span>

		<span
			class="yay-cart-trigger__count"
			data-wp-text="state.itemCount"
		></span>

		<span
			class="yay-cart-trigger__subtotal"
			data-wp-text="state.subtotal"
		></span>
	</button>
</div>
