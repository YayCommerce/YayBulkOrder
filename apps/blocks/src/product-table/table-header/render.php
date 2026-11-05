<?php
/**
 * Table header. Rendered on the server so the default column labels follow
 * the site language — save.tsx stores them in English, and that saved markup
 * is ignored here. A column's `label` (set by the shortcode from its own
 * headings) takes priority over the default label.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$default_labels = array(
	'yay-bulk-order/product-table-column-product'     => __( 'Product', 'yay-bulk-order' ),
	'yay-bulk-order/product-table-column-sku'         => __( 'SKU', 'yay-bulk-order' ),
	'yay-bulk-order/product-table-column-description' => __( 'Description', 'yay-bulk-order' ),
	'yay-bulk-order/product-table-column-quantity'    => __( 'Quantity', 'yay-bulk-order' ),
	'yay-bulk-order/product-table-column-subtotal'    => __( 'Subtotal', 'yay-bulk-order' ),
	'yay-bulk-order/product-table-column-add-to-cart' => __( 'Add to Cart', 'yay-bulk-order' ),
	'yay-bulk-order/product-table-column-select'      => '',
);

$columns = (array) ( $attributes['columns'] ?? array() );
?>
<thead <?php echo get_block_wrapper_attributes( array( 'data-wp-init' => 'callbacks.watchBackToTopVisibility' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<tr>
		<?php foreach ( $columns as $column ) : ?>
			<?php
			$name       = $column['name'] ?? '';
			$label      = $column['label'] ?? ( $default_labels[ $name ] ?? '' );
			$class_name = $column['className'] ?? '';
			?>
			<th<?php echo '' !== $class_name ? ' class="' . esc_attr( $class_name ) . '"' : ''; ?>><?php echo esc_html( $label ); ?></th>
		<?php endforeach; ?>
	</tr>
</thead>
