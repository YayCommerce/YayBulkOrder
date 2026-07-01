<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

$product_id = get_the_ID();
$product = wc_get_product( $product_id );

?>

<td
    <?php echo get_block_wrapper_attributes(); ?>
>
    <a href="<?php echo esc_url( get_permalink( $product_id ) ); ?>" target="_blank">
        <?php  echo empty($product) ? 'No Product' : esc_html( $product->get_title() ); ?>
    </a>
</td>
