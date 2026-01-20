<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

$context = $block->context;
$product_id = $context['productId'] ?? 0;

$product = wc_get_product( $product_id );
?>



<td
    <?php echo get_block_wrapper_attributes(); ?>
>
    <?php
    if ( $product ) {
        echo esc_html( $product->get_price() );
    } else {
        echo esc_html__( '...', 'yay-bulk-order' );
    }
    ?>
</td>
