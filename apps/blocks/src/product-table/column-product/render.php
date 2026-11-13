<?php
/**
 * Product column: thumbnail, title, and a badge showing the quantity
 * already in the cart.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use YayBulkOrder\Utils\BlockHelper;

$product_id = absint( $block->context['yay-bulk-order/productId'] ?? get_the_ID() );
$product    = wc_get_product( $product_id );

if ( ! $product instanceof WC_Product ) {
	printf( '<td %1$s>%2$s</td>', get_block_wrapper_attributes(), esc_html__( 'No Product', 'yay-bulk-order' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}

$thumbnail = $product->get_image( 'woocommerce_thumbnail', array( 'class' => 'ybod-product-thumbnail__image' ) );

$is_variation = $product instanceof WC_Product_Variation;
$title        = $is_variation ? wc_get_formatted_variation( $product, true, false ) : $product->get_title();
$permalink    = $product->get_permalink();
?>

<td <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<a href="<?php echo esc_url( $permalink ); ?>" target="_blank" class="ybod-product-cell<?php echo $is_variation ? ' ybod-product-cell--variation' : ''; ?>" title="<?php echo esc_attr( $title ? $title : $product->get_title() ); ?>">
		<span class="ybod-product-thumbnail">
			<?php echo wp_kses( $thumbnail, BlockHelper::get_table_row_allowed_html() ); ?>
			<span
				class="ybod-product-thumbnail__badge"
				data-wp-bind--hidden="!context.cartQuantity"
				data-wp-text="context.cartQuantity"
			></span>
		</span>
		<span class="ybod-product-title"><?php echo esc_html( $title ? $title : $product->get_title() ); ?></span>
	</a>
</td>
