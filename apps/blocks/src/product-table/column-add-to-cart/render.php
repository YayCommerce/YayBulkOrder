<?php
/**
 * Add to Cart column.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

$product_id = absint( $block->context['yay-bulk-order/productId'] ?? get_the_ID() );
$product    = wc_get_product( $product_id );

if ( ! $product instanceof WC_Product ) {
	printf( '<td %s></td>', get_block_wrapper_attributes() );
	return;
}
$product_type = $product->get_type();
$button_attributes = wc_implode_html_attributes(
	array(
		'class'            => implode(
			' ',
			array(
				'wp-block-button__link',
				'wp-element-button',
				'wc-block-components-product-button__button',
				'ybo-add-to-cart-button',
				'product_type_' . $product_type,
			)
		),
		'data-product_id'  => (string) $product_id,
		'data-product_sku' => $product->get_sku(),
		'aria-label'       => wp_strip_all_tags( $product->add_to_cart_description() ),
	)
);
$button_text = $product->add_to_cart_text() ?: __( 'Add to cart', 'yay-bulk-order' );
?>

<td <?php echo get_block_wrapper_attributes( array( 'class' => 'wp-block-button wc-block-components-product-button' ) ); ?>>
	<?php if ( $product->supports( 'ajax_add_to_cart' ) ) : ?>
		<button type="button" <?php echo $button_attributes;?>
			data-wp-on--click="actions.addToCart"
			data-wp-bind--disabled="context.isAddingToCart"
			data-wp-class--loading="context.isAddingToCart"
		>
			<span data-wp-text="state.addToCartText"><?php echo esc_html( $button_text ); ?></span>
		</button>
	<?php elseif ( $product->is_purchasable() || in_array( $product_type, array( 'variable', 'grouped', 'external' ), true ) ) : ?>
		<a href="<?php echo esc_url( $product->add_to_cart_url() ); ?>" <?php echo $button_attributes;?> <?php echo $product->is_type( 'external' ) ? 'target="_blank" rel="nofollow noopener noreferrer"' : 'rel="nofollow"';?>>
			<?php echo esc_html( $button_text ); ?>
		</a>
	<?php else : ?>
		<span class="ybo-add-to-cart-unavailable"><?php esc_html_e( 'Not Available', 'yay-bulk-order' ); ?></span>
	<?php endif; ?>
</td>