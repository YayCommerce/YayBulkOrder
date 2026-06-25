<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

use YayBulkOrder\Services\SettingsService;

$settings_service = SettingsService::get_instance();
$settings = $settings_service->get_settings();
$default_cart_quantity = $settings['general']['defaultCartQuantity'];

$variant = $attributes['variant'] ?? 'editing';
$context = $block->context;
$product_id = $context['yay-bulk-order/productId'];


$cart_quantity = 0;

if ( !! $product_id ) {
    $product = wc_get_product( $product_id );
    $cart = WC()->cart;
    if ( $cart ) {
        $cart_items = $cart->get_cart();
        foreach ( $cart_items as $cart_item_key => $cart_item ) {
            if ( $cart_item['product_id'] == $product_id ) {
                $cart_quantity = $cart_item['quantity'];
                break;
            }
        }
    }
} else {
    $product = null;
}

$is_purchasable = $product && $product->is_purchasable();
$is_in_stock = $product && $product->is_in_stock();
$product_type = $product ? $product->get_type() : 'simple';
$min_quantity = $product ? $product->get_min_purchase_quantity() : 1;
$is_supported_product = $product && in_array( $product_type, [ 'simple' ], true );

$data_context = [
    'productId' => $product_id,
    'minQuantity' => $min_quantity,
    'stepQuantity' => $default_cart_quantity,
    'addingQuantity' => $default_cart_quantity,
    'editingQuantity' => $cart_quantity,
];

?>
<td
    data-product-type="<?php echo esc_attr( $product_type ); ?>"
    <?php echo get_block_wrapper_attributes([ 'class' => $variant === 'editing' ? 'editing-variant' : 'adding-variant' ]); ?>
    data-wp-interactive="yay-bulk-order/add-to-cart"
    <?php echo wp_interactivity_data_wp_context( $data_context ); ?>
>
    <?php if ( null !== $product && false !== $product ) : ?>
        <?php if ( $is_purchasable && $is_in_stock ) : ?>
            <div style="display: flex; gap: 1px; align-items: center;">
                
                <?php if ( $is_supported_product && $variant === 'adding' ) : ?>
                    <input 
                        type="number"
                        step="<?php echo esc_attr( $default_cart_quantity ); ?>"
                        min="<?php echo esc_attr( $min_quantity ); ?>"
                        data-wp-bind--value="context.addingQuantity"
                        data-wp-on--input="actions.updateAddingQuantity"
                        aria-label="<?php echo esc_attr__( 'Quantity', 'yay-bulk-order' ); ?>"
                    />
                    <button 
                        data-wp-on--click="actions.addToCart"
                        aria-label="<?php echo esc_attr__( 'Add to cart', 'yay-bulk-order' ); ?>"
                    >
                        <span data-wp-text="state.addingButtonText"><?php echo esc_html__( 'Add to Cart', 'yay-bulk-order' ); ?></span>
                    </button>

                <?php elseif ( $is_supported_product && $variant === 'editing' ) : ?>
                    <input
                        type="number"
                        data-wp-bind--value="context.editingQuantity"
                        data-wp-on--input="actions.updateEditingQuantity"
                    />
                    <button data-wp-on--click="actions.increaseEditingQuantity">+</button>
                    <button data-wp-on--click="actions.decreaseEditingQuantity">-</button>
                    <span>Todo</span>
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
                echo '(' . esc_html__( 'External', 'yay-bulk-order' ) . ')';
            } elseif ( $product->is_virtual() ) {
                echo '(' . esc_html__( 'Virtual', 'yay-bulk-order' ) . ')';
            } else {
                echo '(' . esc_html__( 'Collection', 'yay-bulk-order' ) . ')';
            }
            ?>
        <?php endif; ?>
    
    <?php endif; ?>
</td>
