<?php

use YayBulkOrder\Utils\BlockHelper;
use YayBulkOrder\Services\ProductQueryService;

/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

$product_query_service = ProductQueryService::get_instance();

$query_vars = $product_query_service->build_query_vars_from_query_block( $block );
$query = new WP_Query( $query_vars );

$current_page = $product_query_service->get_page_param( $block );
$total_pages = $query->max_num_pages;
$has_previous_page = $current_page > 1;
$has_next_page = $current_page < $total_pages;

$query_id = $block->context['queryId'] ?? 0;
$page_key = 'query-' . $query_id . '-page';
$previous_page_url = $has_previous_page ? add_query_arg( $page_key, $current_page - 1 ) : '#';
$next_page_url = $has_next_page ? add_query_arg( $page_key, $current_page + 1 ) : '#';

$previous_link_attrs = [
    'href' => $previous_page_url,
    'aria-label' => __( 'Previous Page', 'yay-bulk-order' ),
    'class' => $has_previous_page ? '' : 'is-disabled',
    'data-wp-key' => 'table-pagination-previous',
    'data-wp-on--click' => $has_previous_page ? 'yay-bulk-order/bulk-order-form::actions.navigate' : '',
    'data-wp-on--mouseenter' => $has_previous_page ? 'yay-bulk-order/bulk-order-form::actions.prefetchOnHover' : '',
];
$next_link_attrs = [
    'href' => $next_page_url,
    'aria-label' => __( 'Next Page', 'yay-bulk-order' ),
    'class' => $has_next_page ? '' : 'is-disabled',
    'data-wp-key' => 'table-pagination-next',
    'data-wp-on--click' => $has_next_page ? 'yay-bulk-order/bulk-order-form::actions.navigate' : '',
    'data-wp-on--mouseenter' => $has_next_page ? 'yay-bulk-order/bulk-order-form::actions.prefetchOnHover' : '',
];

?>

<nav
    <?php echo get_block_wrapper_attributes(); ?>
>
    <span> <?php echo sprintf( __( '%d / %d Pages', 'yay-bulk-order' ), $current_page, $total_pages ); ?> </span>
    <a
        <?php echo BlockHelper::esc_attr_array( $previous_link_attrs ); ?>
    > <?php _e('Previous', 'yay-bulk-order'); ?> </a>
    <a
        <?php echo BlockHelper::esc_attr_array( $next_link_attrs ); ?>
    > <?php _e('Next', 'yay-bulk-order'); ?> </a>
</nav>
