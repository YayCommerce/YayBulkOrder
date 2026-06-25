<?php
if ( ! function_exists( 'WC' ) ) {
	return;
}
use YayBulkOrder\Services\SettingsService;

$settings = SettingsService::get_instance()->get_settings();

wp_interactivity_config(
  'yay-bulk-order/cart-summary',
  [
    'settings' => [
      'styles' => [
        'colors'       => $settings['styles']['colors'],
        'borderRadius' => $settings['styles']['borderRadius'],
      ],
    ],
  ]
);
?>

<!-- Hidden Woo Mini Cart (mount React + store) -->
<div style="display:none">
	<?php echo do_blocks( '<!-- wp:woocommerce/mini-cart /-->' ); ?>
</div>

<div
	<?php echo get_block_wrapper_attributes(); ?>
	data-wp-interactive="yay-bulk-order/cart-summary"
	data-wp-context='{"isOpen": false, "itemCount": 0, "subtotal": ""}'
	data-wp-init="callbacks.init"
>
	<button
		type="button"
		data-wp-on--click="actions.openMiniCart"
		data-wp-bind--aria-label="state.buttonText"
		data-wp-bind--title="state.buttonText"
		data-wp-class--is-empty="state.isEmpty"
	>
		<span class="yay-cart-trigger__icon">
			<?php echo esc_html__( 'Cart', 'yay-bulk-order' ); ?>
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
