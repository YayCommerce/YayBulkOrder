<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'WC' ) ) {
	return;
}
?>

<!-- Hidden Woo Mini Cart (mount React + store) -->
<div style="display:none">
	<?php echo do_blocks( '<!-- wp:woocommerce/mini-cart /-->' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>

<div
	<?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
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
		<span class="yay-cart-trigger__icon" aria-hidden="true">
			<svg width="23px" height="24px" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M15.4189 20.9995H7.57253C4.69037 20.9995 2.47928 19.9624 3.10734 15.7881L3.83863 10.131C4.22578 8.04812 5.55932 7.25098 6.72939 7.25098H16.2964C17.4837 7.25098 18.7398 8.10812 19.1872 10.131L19.9185 15.7881C20.4519 19.4909 18.301 20.9995 15.4189 20.9995Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M15.5476 7.04574C15.5476 4.81136 13.7295 3.00004 11.4867 3.00004C10.4067 2.99548 9.36944 3.41971 8.60416 4.17892C7.83888 4.93813 7.40868 5.96978 7.40869 7.04574H7.40869" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M15.1016 11.5496H15.0568" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M7.94337 11.5496H7.89863" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</span>

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
