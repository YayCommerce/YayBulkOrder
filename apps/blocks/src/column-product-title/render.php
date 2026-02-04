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
    <?php if ( null !== $product && false !== $product ) : ?>
        <a href="<?php echo esc_url( get_permalink( $product_id ) ); ?>" target="_blank">
            <?php echo esc_html( $product->get_title() ); ?>
        </a>
    <?php else : ?>
        No Product
    <?php endif; ?>
</td>
