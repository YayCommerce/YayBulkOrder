<?php
/**
 * Table header. Rendered on the server so the column labels follow the site
 * language — save.tsx stores them in English, and that saved markup is
 * ignored here.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$labels = array(
	'yay-bulk-order/variant-table-column-product'     => __( 'Product', 'yay-bulk-order' ),
	'yay-bulk-order/variant-table-column-sku'         => __( 'SKU', 'yay-bulk-order' ),
	'yay-bulk-order/variant-table-column-description' => __( 'Description', 'yay-bulk-order' ),
	'yay-bulk-order/variant-table-column-quantity'    => __( 'Qty', 'yay-bulk-order' ),
	'yay-bulk-order/variant-table-column-subtotal'    => __( 'Subtotal', 'yay-bulk-order' ),
	'yay-bulk-order/variant-table-column-select'      => '',
);

$columns = (array) ( $attributes['columns'] ?? array() );
?>
<thead <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<tr>
		<?php foreach ( $columns as $name ) : ?>
			<th><?php echo esc_html( $labels[ $name ] ?? '' ); ?></th>
		<?php endforeach; ?>
	</tr>
</thead>
