<?php

use YayBulkOrder\Utils\BlockHelper;

/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

$query_id = $block->context['queryId'] ?? 0;
$page_key = 'query-' . $query_id . '-page';
$filter_key = 'query-' . $query_id . '-filter';

$filter_all_url = add_query_arg( [$filter_key => 'all', $page_key => 1] );
$filter_in_stock_url = add_query_arg( [$filter_key => 'in-stock', $page_key => 1] );
$filter_on_sale_url = add_query_arg( [$filter_key => 'on-sale', $page_key => 1] );

$all_link_attrs = [
    'href' => $filter_all_url,
    'aria-label' => __( 'Filter All', 'yay-bulk-order' ),
    'data-wp-key' => 'table-filter-all',
    'data-wp-on--click' => 'yay-bulk-order/bulk-order-form::actions.navigate',
    'data-wp-on--mouseenter' => 'yay-bulk-order/bulk-order-form::actions.prefetchOnHover',
];
$in_stock_link_attrs = [
    'href' => $filter_in_stock_url,
    'aria-label' => __( 'Filter In Stock', 'yay-bulk-order' ),
    'data-wp-key' => 'table-filter-in-stock',
    'data-wp-on--click' => 'yay-bulk-order/bulk-order-form::actions.navigate',
    'data-wp-on--mouseenter' => 'yay-bulk-order/bulk-order-form::actions.prefetchOnHover',
];
$on_sale_link_attrs = [
    'href' => $filter_on_sale_url,
    'aria-label' => __( 'Filter On Sale', 'yay-bulk-order' ),
    'data-wp-key' => 'table-filter-on-sale',
    'data-wp-on--click' => 'yay-bulk-order/bulk-order-form::actions.navigate',
    'data-wp-on--mouseenter' => 'yay-bulk-order/bulk-order-form::actions.prefetchOnHover',
];

?>

<nav
    <?php echo get_block_wrapper_attributes(); ?>
>
    <a
        <?php echo BlockHelper::esc_attr_array( $all_link_attrs ); ?>
    > <?php _e('All', 'yay-bulk-order'); ?> </a>
    <a
        <?php echo BlockHelper::esc_attr_array( $in_stock_link_attrs ); ?>
    > <?php _e('In Stock', 'yay-bulk-order'); ?> </a>
    <a
        <?php echo BlockHelper::esc_attr_array( $on_sale_link_attrs ); ?>
    > <?php _e('On Sale', 'yay-bulk-order'); ?> </a>
</nav>
