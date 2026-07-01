<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

?>

<td
    <?php echo get_block_wrapper_attributes(); ?>
>
    <button data-wp-on--click="actions.addToCart" style="background-color: var(--ybo-primary-color); padding: 12px 8px;">
        Add To Cart
    </button>
</td>
