<?php

use YayBulkOrder\Utils\BlockHelper;

/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

$query_id = $block->context['queryId'] ?? 0;
$page_param_key = 'query-' . $query_id . '-page';
$filter_param_key = 'query-' . $query_id . '-filter';

$page_param = BlockHelper::get_page_param( $query_id );
$filter_param = BlockHelper::get_filter_param( $query_id );

$filter_all_url = add_query_arg( [$filter_param_key => 'all', $page_param_key => 1] );
$filter_in_stock_url = add_query_arg( [$filter_param_key => 'in-stock', $page_param_key => 1] );
$filter_on_sale_url = add_query_arg( [$filter_param_key => 'on-sale', $page_param_key => 1] );

$all_link_attrs = [
    'href' => $filter_all_url,
    'aria-label' => __( 'Filter All', 'yay-bulk-order' ),
    "class" => $filter_param === 'all' ? 'is-selected' : '',
    'data-wp-key' => 'table-filter-all',
    'data-wp-on--click' => 'yay-bulk-order/bulk-order-form::actions.navigate',
    'data-wp-on--mouseenter' => 'yay-bulk-order/bulk-order-form::actions.prefetchOnHover',
];
$in_stock_link_attrs = [
    'href' => $filter_in_stock_url,
    'aria-label' => __( 'Filter In Stock', 'yay-bulk-order' ),
    "class" => $filter_param === 'in-stock' ? 'is-selected' : '',
    'data-wp-key' => 'table-filter-in-stock',
    'data-wp-on--click' => 'yay-bulk-order/bulk-order-form::actions.navigate',
    'data-wp-on--mouseenter' => 'yay-bulk-order/bulk-order-form::actions.prefetchOnHover',
];
$on_sale_link_attrs = [
    'href' => $filter_on_sale_url,
    'aria-label' => __( 'Filter On Sale', 'yay-bulk-order' ),
    "class" => $filter_param === 'on-sale' ? 'is-selected' : '',
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
