<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

$context = $block->context;
$product_id = $context['yay-bulk-order/productId'];

if ( !! $product_id ) {
    $product = wc_get_product( $product_id );
} else {
    $product = null;
}
?>

<td
    <?php echo get_block_wrapper_attributes(); ?>
>
    <?php
    if ( null !== $product && false !== $product ) {
        echo wc_price( $product->get_price() ) ;
    } else {
        echo esc_html__( '...', 'yay-bulk-order' );
    }
    ?>
</td>
