<?php
/**
 * Title: Filterable Bulk Order Form
 * Slug: yay-bulk-order/filterable-bulk-order
 * Categories: yay-bulk-order
 * Block Types: yay-bulk-order/bulk-order-form
 */
?>

<!-- wp:yay-bulk-order/bulk-order-form {"queryId":9} -->
<!-- wp:heading -->
<h2 class="wp-block-heading"><strong>Filterable Bulk Order Form</strong></h2>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"layout":{"type":"flex","orientation":"vertical","flexWrap":"nowrap"}}} -->
<div class="wp-block-group">
    
    <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
    <div class="wp-block-group">
        <!-- wp:yay-bulk-order/table-filter /-->
        <!-- wp:yay-bulk-order/cart-summary /-->
    </div><!-- /wp:group -->

    <!-- wp:yay-bulk-order/table-template -->
    <!-- wp:yay-bulk-order/column-product-title /-->
    <!-- wp:yay-bulk-order/column-product-stock /-->
    <!-- wp:yay-bulk-order/column-product-price /-->
    <!-- wp:yay-bulk-order/column-add-to-cart /-->
    <!-- /wp:yay-bulk-order/table-template -->

    <!-- wp:yay-bulk-order/table-pagination /-->
</div><!-- /wp:group -->
<!-- /wp:yay-bulk-order/bulk-order-form -->