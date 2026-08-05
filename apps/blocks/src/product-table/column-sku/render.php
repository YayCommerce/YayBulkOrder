<?php
/**
 * SKU column.
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

$sku = $product->get_sku();
?>

<td <?php echo get_block_wrapper_attributes(); ?>>
	<?php echo $sku ? esc_html( $sku ) : '&mdash;'; ?>
</td>
