<?php

/**
 * Title: Simple Product Table
 * Slug: yay-bulk-order/simple-product-table
 * Categories: yay-bulk-order
 * Block Types: yay-bulk-order/product-table-root
 * Description: Display products in a clean, scannable table so customers can browse and add items to cart in bulk. The foundation of every bulk order experience. (Only 4 essential columns, fit for small space)
 *
 * @package yaycommerce/yay-bulk-order
 */

?>
<!-- wp:yay-bulk-order/product-table-root {"queryId":709565,"productQuery":{"queryType":"all-products","hasPagination":true},"hasSelectedQuery":true} -->
<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:yay-bulk-order/product-table-filter /-->

<!-- wp:yay-bulk-order/cart-summary /--></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ybo-filter-layout","layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group ybo-filter-layout"><!-- wp:yay-bulk-order/product-table-filter-sidebar /-->

<!-- wp:group {"className":"ybo-table-column"} -->
<div class="wp-block-group ybo-table-column"><!-- wp:yay-bulk-order/product-table -->
<table class="wp-block-yay-bulk-order-product-table"><!-- wp:yay-bulk-order/product-table-header {"columns":["yay-bulk-order/product-table-column-product","yay-bulk-order/product-table-column-quantity","yay-bulk-order/product-table-column-subtotal","yay-bulk-order/product-table-column-add-to-cart","yay-bulk-order/product-table-column-select"]} -->
<thead class="wp-block-yay-bulk-order-product-table-header" data-wp-init="callbacks.watchBackToTopVisibility"><tr><th>Product</th><th>Quantity</th><th>Subtotal</th><th>Add to Cart</th><th></th></tr></thead>
<!-- /wp:yay-bulk-order/product-table-header -->

<!-- wp:yay-bulk-order/product-table-columns -->
<!-- wp:yay-bulk-order/product-table-column-product /-->

<!-- wp:yay-bulk-order/product-table-column-quantity /-->

<!-- wp:yay-bulk-order/product-table-column-subtotal /-->

<!-- wp:yay-bulk-order/product-table-column-add-to-cart /-->

<!-- wp:yay-bulk-order/product-table-column-select /-->
<!-- /wp:yay-bulk-order/product-table-columns --></table>
<!-- /wp:yay-bulk-order/product-table -->

<!-- wp:yay-bulk-order/product-table-footer -->
<div class="wp-block-yay-bulk-order-product-table-footer"><!-- wp:yay-bulk-order/product-table-pagination /-->

<!-- wp:yay-bulk-order/product-table-bulk-action /--></div>
<!-- /wp:yay-bulk-order/product-table-footer --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:yay-bulk-order/product-table-root -->
