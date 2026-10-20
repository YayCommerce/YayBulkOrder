<?php
/**
 * Description column.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

$variation_id = absint( $block->context['yay-bulk-order/productId'] ?? 0 );
$variation    = $variation_id ? wc_get_product( $variation_id ) : null;

if ( ! $variation instanceof WC_Product ) {
	printf( '<td %s></td>', get_block_wrapper_attributes() );
	return;
}

$description = $variation->get_description();
$description = $description ? wp_trim_words( wp_strip_all_tags( $description ), 20 ) : '';
?>

<td <?php echo get_block_wrapper_attributes(); ?>>
	<?php echo $description ? esc_html( $description ) : '&mdash;'; ?>
</td>
