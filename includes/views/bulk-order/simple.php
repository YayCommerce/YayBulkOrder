<?php
/**
 * Simple Bulk Order Table
 *
 * @var WC_Product[] $products
 */
?>

<form method="post" class="yay-bulk-order-form">
    <input type="hidden" name="yay_bulk_order_action" value="submit" />
    <?php wp_nonce_field( 'yay_bulk_order_submit', 'yay_bulk_order_nonce' ); ?>

    <table class="yay-bulk-order-table">
        <thead>
            <tr>
               
                <th><?php esc_html_e( 'Image', 'yay-bulk-order' ); ?></th>
                <th><?php esc_html_e( 'Name', 'yay-bulk-order' ); ?></th>
                <th><?php esc_html_e( 'Price', 'yay-bulk-order' ); ?></th>
                <th><?php esc_html_e( 'Category', 'yay-bulk-order' ); ?></th>
                <th><?php esc_html_e( 'Stock', 'yay-bulk-order' ); ?></th>
                <th><?php esc_html_e( 'Quantity', 'yay-bulk-order' ); ?></th>
            </tr>
        </thead>

        <tbody>
            <?php foreach ( $products as $product ) : ?>
                <tr>
                   
                    <!-- Product -->
                    <td class="product-cell">
                        <?php echo $product->get_image( 'thumbnail' ); ?>
                       
                    </td>

                    <!-- Name -->
                    <td>
                        <a href="<?php echo esc_url( $product->get_permalink() ); ?>" class="product-name"><?php echo esc_html( $product->get_name() ); ?></a>
                    </td>

                    <!-- Price -->
                    <td>
                        <?php echo wp_kses_post( $product->get_price_html() ); ?>
                    </td>

                    <!-- Category -->
                    <td>
                        <?php
                        $categories = wc_get_product_terms( $product->get_id(), 'product_cat', [ 'fields' => 'names' ] );
                        echo esc_html( implode( ', ', $categories ) );
                        ?>
                    </td>

                    <!-- Stock -->
                    <td>
                        <?php if ( $product->is_in_stock() ) : ?>
                            <span class="yay-stock in-stock">
                                <?php esc_html_e( 'In Stock', 'yay-bulk-order' ); ?>
                            </span>
                        <?php else : ?>
                            <span class="yay-stock out-of-stock">
                                <?php esc_html_e( 'Out of Stock', 'yay-bulk-order' ); ?>
                            </span>
                        <?php endif; ?>
                    </td>

                    <!-- Quantity -->
                    <td>
                        <div class="qty-wrapper">
                            <input
                                type="number"
                                name="products[<?php echo esc_attr( $product->get_id() ); ?>]"
                                min="0"
                                value="0"
                            />
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <button type="submit" class="yay-add-to-cart">
        <?php esc_html_e( 'Add to cart', 'yay-bulk-order' ); ?>
    </button>
</form>
