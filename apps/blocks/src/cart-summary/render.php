<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
    return;
}

$cart = WC()->cart;
$cart_items = $cart->get_cart();

// Calculate totals - ensure cart is calculated
if ( ! $cart->is_empty() ) {
    $cart->calculate_totals();
}

$subtotal = $cart->get_subtotal();
$shipping_total = $cart->get_shipping_total();
$tax_total = $cart->get_total_tax();
$discount_total = abs( $cart->get_discount_total() ); // Get absolute value for display
$total = $cart->get_total( 'edit' );

// Get cart page and checkout URLs
$cart_url = wc_get_cart_url();
$checkout_url = wc_get_checkout_url();

// Prepare cart data for interactivity
$cart_data = [
    'items' => [],
    'totals' => [
        'subtotal' => $subtotal,
        'shipping' => $shipping_total,
        'tax' => $tax_total,
        'discount' => $discount_total,
        'total' => $total,
    ],
    'hasShipping' => $shipping_total > 0,
    'hasTax' => $tax_total > 0,
    'hasDiscount' => $discount_total > 0,
    'itemCount' => $cart->get_cart_contents_count(),
    'cartUrl' => $cart_url,
    'checkoutUrl' => $checkout_url,
];

// Prepare cart items data
foreach ( $cart_items as $cart_item_key => $cart_item ) {
    $product = $cart_item['data'];
    if ( ! $product ) {
        continue;
    }

    $cart_data['items'][] = [
        'key' => $cart_item_key,
        'productId' => $cart_item['product_id'],
        'variationId' => $cart_item['variation_id'],
        'quantity' => $cart_item['quantity'],
        'name' => $product->get_name(),
        'price' => $product->get_price(),
        'lineTotal' => $cart_item['line_subtotal'],
        'thumbnail' => $product->get_image( 'thumbnail' ),
    ];
}

// Set interactivity state
wp_interactivity_state(
    'yay-bulk-order/cart-summary',
    [
        'cartUrl' => $cart_url,
        'checkoutUrl' => $checkout_url,
    ]
);

$data_context = [
    'cart' => $cart_data,
    'isLoading' => false,
];
?>

<div
    <?php echo get_block_wrapper_attributes( [ 'class' => 'wp-block-yay-bulk-order-cart-summary' ] ); ?>
    data-wp-interactive="yay-bulk-order/cart-summary"
    <?php echo wp_interactivity_data_wp_context( $data_context ); ?>
    data-wp-init="callbacks.onInit"
>
    <?php if ( empty( $cart_items ) ) : ?>
        <div class="cart-summary-empty">
            <p><?php echo esc_html__( 'Your cart is empty.', 'yay-bulk-order' ); ?></p>
        </div>
    <?php else : ?>
        <div class="cart-summary-content">
            <!-- Cart Items List -->
            <div class="cart-summary-items">
                <h3 class="cart-summary-title"><?php echo esc_html__( 'Cart Items', 'yay-bulk-order' ); ?></h3>
                <table class="cart-items-table">
                    <thead>
                        <tr>
                            <th><?php echo esc_html__( 'Thumbnail', 'yay-bulk-order' ); ?></th>
                            <th><?php echo esc_html__( 'Product', 'yay-bulk-order' ); ?></th>
                            <th><?php echo esc_html__( 'Quantity', 'yay-bulk-order' ); ?></th>
                            <th><?php echo esc_html__( 'Price', 'yay-bulk-order' ); ?></th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ( $cart_items as $cart_item_key => $cart_item ) : ?>
                            <?php
                            $product = $cart_item['data'];
                            if ( ! $product ) {
                                continue;
                            }
                            $line_total = wc_price( $cart_item['line_subtotal'] );
                            ?>
                            <tr class="cart-item" data-cart-item-key="<?php echo esc_attr( $cart_item_key ); ?>">
                                <td class="cart-item-thumbnail">
                                    <?php echo $product->get_image( 'thumbnail' ); ?>
                                </td>
                                <td class="cart-item-name">
                                    <?php echo esc_html( $product->get_name() ); ?>
                                    <br/>
                                    <button
                                        type="button"
                                        class="cart-item-remove"
                                        data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>"
                                        data-wp-on--click="actions.removeItem"
                                        aria-label="<?php echo esc_attr__( 'Remove item', 'yay-bulk-order' ); ?>"
                                    >
                                        <span data-wp-text="state.removeButtonText"><?php echo esc_html__( 'Remove', 'yay-bulk-order' ); ?></span>
                                    </button>
                                </td>
                                <td class="cart-item-quantity">
                                    <input
                                        disabled
                                        type="number"
                                        class="cart-item-quantity-input"
                                        min="1"
                                        value="<?php echo esc_attr( $cart_item['quantity'] ); ?>"
                                        data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>"
                                        data-wp-on--change="actions.updateItemQuantity"
                                    />
                                </td>
                                <td class="cart-item-price">
                                    <?php echo $line_total; ?>
                                </td>
                                
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Cart Totals -->
            <div class="cart-summary-totals">
                <table class="cart-totals-table">
                    <tbody>
                        <tr class="cart-totals-row cart-subtotal">
                            <th><?php echo esc_html__( 'Subtotal', 'yay-bulk-order' ); ?></th>
                            <td><?php echo wc_price( $subtotal ); ?></td>
                        </tr>
                        <?php if ( $shipping_total > 0 ) : ?>
                            <tr class="cart-totals-row cart-shipping">
                                <th><?php echo esc_html__( 'Shipping', 'yay-bulk-order' ); ?></th>
                                <td><?php echo wc_price( $shipping_total ); ?></td>
                            </tr>
                        <?php endif; ?>
                        <?php if ( $tax_total > 0 ) : ?>
                            <tr class="cart-totals-row cart-tax">
                                <th><?php echo esc_html__( 'Tax', 'yay-bulk-order' ); ?></th>
                                <td><?php echo wc_price( $tax_total ); ?></td>
                            </tr>
                        <?php endif; ?>
                        <?php if ( $discount_total > 0 ) : ?>
                            <tr class="cart-totals-row cart-discount">
                                <th><?php echo esc_html__( 'Discount', 'yay-bulk-order' ); ?></th>
                                <td class="cart-discount-amount">-<?php echo wc_price( $discount_total ); ?></td>
                            </tr>
                        <?php endif; ?>
                        <tr class="cart-totals-row cart-total">
                            <th><?php echo esc_html__( 'Total', 'yay-bulk-order' ); ?></th>
                            <td class="cart-total-amount"><?php echo wc_price( $total ); ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Action Buttons -->
            <div class="cart-summary-actions">
                <a
                    href="<?php echo esc_url( $cart_url ); ?>"
                    class="button"
                >
                    <?php echo esc_html__( 'View Cart', 'yay-bulk-order' ); ?>
                </a>
                <a
                    href="<?php echo esc_url( $checkout_url ); ?>"
                    class="button"
                >
                    <?php echo esc_html__( 'Checkout', 'yay-bulk-order' ); ?>
                </a>
            </div>
        </div>
    <?php endif; ?>
</div>
