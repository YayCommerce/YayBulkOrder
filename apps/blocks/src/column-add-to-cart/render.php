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

$is_purchasable = $product && $product->is_purchasable();
$is_in_stock = $product && $product->is_in_stock();
$product_type = $product ? $product->get_type() : 'simple';
$min_quantity = $product ? $product->get_min_purchase_quantity() : 1;

$is_supported_product = $product && in_array( $product_type, [ 'simple' ], true );

?>
<td
    data-product-type="<?php echo esc_attr( $product_type ); ?>"
    <?php echo get_block_wrapper_attributes(); ?>
    data-wp-interactive="yay-bulk-order/add-to-cart"
    data-wp-init="callbacks.initQuantity"
    data-wp-context='{
        "productId": <?php echo esc_attr( $product_id ?? 0 ); ?>,
        "quantity": null,
        "isLoading": false
    }'
>
    <?php if ( null !== $product && false !== $product ) : ?>
        <?php if ( $is_purchasable && $is_in_stock ) : ?>
            <div style="display: flex; gap: 8px; align-items: center;">
                
                <?php if ( $is_supported_product ) : ?>
                    <input 
                        type="number"
                        min="<?php echo esc_attr( $min_quantity ); ?>"
                        data-wp-bind--value="context.quantity"
                        data-wp-on--input="actions.updateQuantity"
                        style="width: 60px; padding: 4px; border: 1px solid #ddd; border-radius: 4px;"
                        aria-label="<?php echo esc_attr__( 'Quantity', 'yay-bulk-order' ); ?>"
                    />
                    <button 
                        data-wp-on--click="actions.addToCart"
                        data-wp-bind--disabled="context.isLoading"
                        data-wp-bind--style="state.buttonStyles"
                        style="padding: 6px 12px;"
                        aria-label="<?php echo esc_attr__( 'Add to cart', 'yay-bulk-order' ); ?>"
                    >
                        <span data-wp-text="state.buttonText"><?php echo esc_html__( 'Add to Cart', 'yay-bulk-order' ); ?></span>
                    </button>
               <?php else : ?>
                    <a
                        href="<?php echo esc_url( get_permalink( $product_id ) ); ?>"
                        aria-label="<?php echo esc_attr__( 'Select options', 'yay-bulk-order' ); ?>"
                    >
                        <?php echo esc_html__( 'Select Options', 'yay-bulk-order' ); ?>
                    </a>
                <?php endif; ?>
            </div>
        <?php else : ?>
            <?php
            echo esc_html__( 'Not Available', 'yay-bulk-order' ) . ' ';
            if ( $product_type === 'external' ) {
                echo '(' . esc_html__( 'External Product', 'yay-bulk-order' ) . ')';
            } elseif ( $product->is_virtual() ) {
                echo '(' . esc_html__( 'Virtual Product', 'yay-bulk-order' ) . ')';
            }
            ?>
        <?php endif; ?>
    
    <?php endif; ?>
</td>
