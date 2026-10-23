<?php

/**
 * Title: Simple Bulk Order Form
 * Slug: yay-bulk-order/simple-bulk-order
 * Categories: yay-bulk-order
 * Block Types: yay-bulk-order/bulk-order-form
 *
 * @package yaycommerce/yay-bulk-order
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>


<!-- wp:yay-bulk-order/bulk-order-form -->
<!-- wp:heading -->
<h2 class="wp-block-heading"><br><strong>Simple Bulk Order Form</strong><br></h2>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"layout":{"type":"flex","orientation":"vertical","flexWrap":"nowrap"}}} -->
<div class="wp-block-group">

    <!-- wp:yay-bulk-order/table-template -->
    <!-- wp:yay-bulk-order/column-product-title /-->
    <!-- wp:yay-bulk-order/column-product-stock /-->
    <!-- wp:yay-bulk-order/column-product-price /-->
    <!-- wp:yay-bulk-order/column-add-to-cart /-->
    <!-- /wp:yay-bulk-order/table-template -->

</div><!-- /wp:group -->
<!-- /wp:yay-bulk-order/bulk-order-form -->
