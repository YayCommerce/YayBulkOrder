<?php

/**
 * Title: Some Categories Product Table
 * Slug: yay-bulk-order/some-categories-product-table
 * Categories: yay-bulk-order
 * Block Types: yay-bulk-order/product-table-root
 * Description: Display products in a clean, scannable table so customers can browse and add items to cart in bulk. The foundation of every bulk order experience. (Show all products from some selected categories)
 *
 * @package yaycommerce/yay-bulk-order
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<!-- wp:yay-bulk-order/product-table-root {"queryId":998530,"productQuery":{"queryType":"by-category","categoryIds":[],"hasPagination":false},"hasSelectedQuery":true} -->
<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:yay-bulk-order/product-table-search -->
<div class="wp-block-yay-bulk-order-product-table-search ybod-search"><input type="search" class="ybod-search__input" placeholder="Search products..." aria-label="Search products" data-wp-bind--value="context.tableState.filter.search" data-wp-on--input="actions.updateSearchKeyword" data-wp-on--keydown="actions.handleSearchKeydown"/><span class="ybod-search__icon" data-wp-bind--hidden="state.hasSearchKeyword" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"></circle><path d="M16 16L12.6 12.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></span><button type="button" class="ybod-search__clear" aria-label="Clear search" data-wp-bind--hidden="!state.hasSearchKeyword" data-wp-on--click="actions.clearSearch"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>
<!-- /wp:yay-bulk-order/product-table-search -->

<!-- wp:yay-bulk-order/cart-summary /--></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ybod-filter-layout","layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group ybod-filter-layout"><!-- wp:group {"className":"ybod-table-column"} -->
<div class="wp-block-group ybod-table-column"><!-- wp:yay-bulk-order/product-table -->
<table class="wp-block-yay-bulk-order-product-table"><!-- wp:yay-bulk-order/product-table-header {"columns":[{"name":"yay-bulk-order/product-table-column-product"},{"name":"yay-bulk-order/product-table-column-description"},{"name":"yay-bulk-order/product-table-column-quantity"},{"name":"yay-bulk-order/product-table-column-subtotal"},{"name":"yay-bulk-order/product-table-column-add-to-cart"},{"name":"yay-bulk-order/product-table-column-select"}]} -->
<thead class="wp-block-yay-bulk-order-product-table-header" data-wp-init="callbacks.watchBackToTopVisibility"><tr><th>Product</th><th>Description</th><th>Quantity</th><th>Subtotal</th><th>Add to Cart</th><th></th></tr></thead>
<!-- /wp:yay-bulk-order/product-table-header -->

<!-- wp:yay-bulk-order/product-table-columns -->
<!-- wp:yay-bulk-order/product-table-column-product /-->

<!-- wp:yay-bulk-order/product-table-column-description /-->

<!-- wp:yay-bulk-order/product-table-column-quantity /-->

<!-- wp:yay-bulk-order/product-table-column-subtotal /-->

<!-- wp:yay-bulk-order/product-table-column-add-to-cart /-->

<!-- wp:yay-bulk-order/product-table-column-select /-->
<!-- /wp:yay-bulk-order/product-table-columns --></table>
<!-- /wp:yay-bulk-order/product-table -->

<!-- wp:yay-bulk-order/product-table-footer -->
<div class="wp-block-yay-bulk-order-product-table-footer"><!-- wp:yay-bulk-order/product-table-bulk-action /--></div>
<!-- /wp:yay-bulk-order/product-table-footer --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:yay-bulk-order/product-table-root -->
