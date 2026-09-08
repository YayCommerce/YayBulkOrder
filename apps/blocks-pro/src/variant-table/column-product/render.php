<?php
/**
 * Variation column: thumbnail, variation name (e.g. "Orange, L"), and a
 * badge showing the quantity already in the cart for this variation.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

$variation_id = absint( $block->context['yay-bulk-order/productId'] ?? 0 );
$variation    = $variation_id ? wc_get_product( $variation_id ) : null;

if ( ! $variation instanceof WC_Product ) {
	printf( '<td %1$s>%2$s</td>', get_block_wrapper_attributes(), esc_html__( 'No variation', 'yay-bulk-order' ) );
	return;
}

$thumbnail = $variation->get_image( 'woocommerce_thumbnail', array( 'class' => 'ybo-product-thumbnail__image' ) );
$title     = $variation instanceof WC_Product_Variation ? wc_get_formatted_variation( $variation, true, false ) : $variation->get_title();
$title     = $title ? $title : $variation->get_title();
?>

<td <?php echo get_block_wrapper_attributes(); ?>>
	<span class="ybo-product-cell" title="<?php echo esc_attr( $title ); ?>">
		<span class="ybo-product-thumbnail">
			<?php echo $thumbnail; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WC_Product::get_image() output is already escaped. ?>
			<span
				class="ybo-product-thumbnail__badge"
				data-wp-bind--hidden="!context.cartQuantity"
				data-wp-text="context.cartQuantity"
			></span>
		</span>
		<span class="ybo-product-title"><?php echo esc_html( $title ); ?></span>
	</span>
</td>
