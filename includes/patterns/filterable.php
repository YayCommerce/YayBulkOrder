<?php
/**
 * Title: Filterable Bulk Order Form
 * Slug: yay-bulk-order/filterable-bulk-order
 * Categories: yay-bulk-order
 * Block Types: yay-bulk-order/bulk-order-form
 */
?>

<!-- wp:yay-bulk-order/bulk-order-form {"queryId":9} -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"layout":{"type":"flex","orientation":"vertical","flexWrap":"nowrap"}}} -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading"><strong>Filterable Bulk Order Form</strong><br></h2>
<!-- /wp:heading -->

<!-- wp:yay-bulk-order/table-filter -->
<nav class="wp-block-yay-bulk-order-table-filter"><button>All</button><button>In Stock</button><button>On Sale</button></nav>
<!-- /wp:yay-bulk-order/table-filter -->

<!-- wp:yay-bulk-order/table-template -->
<!-- wp:yay-bulk-order/column-product-title /-->

<!-- wp:yay-bulk-order/column-product-price /-->

<!-- wp:yay-bulk-order/column-product-stock /-->
<!-- /wp:yay-bulk-order/table-template -->

<!-- wp:yay-bulk-order/table-pagination -->
<ul class="wp-block-yay-bulk-order-table-pagination"><li><button>Previous</button></li><li><button>Next</button></li></ul>
<!-- /wp:yay-bulk-order/table-pagination --></div>
<!-- /wp:group -->
<!-- /wp:yay-bulk-order/bulk-order-form -->