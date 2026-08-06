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
   <input
       type="checkbox"
       data-wp-bind--checked="state.isRowSelected"
       data-wp-on--change="actions.toggleSelectRow"
       aria-label="<?php echo esc_attr__( 'Select product', 'yay-bulk-order' ); ?>"
   />
</td>
