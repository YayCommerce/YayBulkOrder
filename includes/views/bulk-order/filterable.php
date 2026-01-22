<?php
/**
 * Filterable Bulk Order Table
 *
 * @var WC_Product[] $products
 */
?>

<!-- FILTER -->
<form method="get" class="yay-bulk-order-filter">
    <div class="yay-bulk-order-toolbar" style="display: flex; justify-content: space-between;align-items: flex-start; gap: 10px;">
        <input
            type="search"
            name="ybo_search"
            value="<?php echo esc_attr( $_GET['ybo_search'] ?? '' ); ?>"
            placeholder="<?php esc_attr_e( 'Search products', 'yay-bulk-order' ); ?>"
        />
    
        <div class="yay-bulk-order-toolbar-category" style="display: flex; gap: 10px;">
            <select name="ybo_category">
                <option value="">
                    <?php esc_html_e( 'All categories', 'yay-bulk-order' ); ?>
                </option>

                <?php
                foreach ( get_terms( 'product_cat', [ 'hide_empty' => true ] ) as $cat ) :
                    ?>
                    <option
                        value="<?php echo esc_attr( $cat->slug ); ?>"
                        <?php selected( $_GET['ybo_category'] ?? '', $cat->slug ); ?>
                    >
                        <?php echo esc_html( $cat->name ); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        
            <button type="submit">
                <?php esc_html_e( 'Filter', 'yay-bulk-order' ); ?>
            </button>
        </div>
    </div>
</form>

<hr />

<!-- TABLE (reuse same structure as simple.php) -->
<?php require __DIR__ . '/simple.php'; ?>
