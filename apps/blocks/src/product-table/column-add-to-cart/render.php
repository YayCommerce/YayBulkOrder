<?php
/**
 * Add to Cart column.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$product_id = absint( $block->context['yay-bulk-order/productId'] ?? get_the_ID() );
$product    = wc_get_product( $product_id );

if ( ! $product instanceof WC_Product ) {
	printf( '<td %s></td>', get_block_wrapper_attributes() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}
$product_type = $product->get_type();

if ( $product instanceof WC_Product_Variable ) {
	$toggle_class = implode(
		' ',
		array(
			'wp-block-button__link',
			'wp-element-button',
			'wc-block-components-product-button__button',
			'ybod-add-to-cart-button',
			'ybod-view-options-button',
			'product_type_' . $product_type,
		)
	);
	?>
	<td <?php echo get_block_wrapper_attributes( array( 'class' => 'wp-block-button wc-block-components-product-button' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<button
			type="button"
			class="<?php echo esc_attr( $toggle_class ); ?>"
			data-wp-on--click="actions.toggleProductVariations"
			data-wp-bind--aria-expanded="state.isProductExpanded"
		>
			<span data-wp-text="state.viewOptionsText"><?php esc_html_e( 'View options', 'yay-bulk-order' ); ?></span>
		</button>
	</td>
	<?php
	return;
}

$button_class = implode(
	' ',
	array(
		'wp-block-button__link',
		'wp-element-button',
		'wc-block-components-product-button__button',
		'ybod-add-to-cart-button',
		'product_type_' . $product_type,
	)
);
$button_label = wp_strip_all_tags( $product->add_to_cart_description() );
$button_text = $product->add_to_cart_text() ?: __( 'Add to cart', 'yay-bulk-order' );
?>

<td <?php echo get_block_wrapper_attributes( array( 'class' => 'wp-block-button wc-block-components-product-button' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php if ( $product->supports( 'ajax_add_to_cart' ) ) : ?>
		<button
			type="button"
			class="<?php echo esc_attr( $button_class ); ?>"
			data-product_id="<?php echo esc_attr( $product_id ); ?>"
			data-product_sku="<?php echo esc_attr( $product->get_sku() ); ?>"
			aria-label="<?php echo esc_attr( $button_label ); ?>"
			data-wp-on--click="actions.addToCart"
			data-wp-bind--disabled="state.isAddToCartDisabled"
			data-wp-class--loading="context.isAddingToCart"
		>
			<span data-wp-text="state.addToCartText"><?php echo esc_html( $button_text ); ?></span>
		</button>
	<?php elseif ( $product->is_purchasable() || in_array( $product_type, array( 'variable', 'grouped', 'external' ), true ) ) : ?>
		<a
			href="<?php echo esc_url( $product->add_to_cart_url() ); ?>"
			class="<?php echo esc_attr( $button_class ); ?>"
			data-product_id="<?php echo esc_attr( $product_id ); ?>"
			data-product_sku="<?php echo esc_attr( $product->get_sku() ); ?>"
			aria-label="<?php echo esc_attr( $button_label ); ?>"
			<?php if ( $product->is_type( 'external' ) ) : ?>
				target="_blank"
				rel="nofollow noopener noreferrer"
			<?php else : ?>
				rel="nofollow"
			<?php endif; ?>
		>
			<?php echo esc_html( $button_text ); ?>
		</a>
	<?php else : ?>
		<span class="ybod-add-to-cart-unavailable"><?php esc_html_e( 'Not Available', 'yay-bulk-order' ); ?></span>
	<?php endif; ?>
</td>