<?php
/**
 * @var array{queryId: number, forcePageReload: boolean} $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

// Generates a unique id for aria-controls.
$unique_id = wp_unique_id( 'ybo-' );

wp_interactivity_state(
    'yay-bulk-order/bulk-order-form',
    [
        'isBlockTheme' => wp_is_block_theme(),
        'pageSize'     => 5,
    ]
);

$queryId = $attributes['queryId'] ?? 0;
$forcePageReload = $attributes['forcePageReload'] ?? false;
$page_param = get_query_var( 'query' . $queryId . 'page' );
$filter_param = get_query_var( 'query' . $queryId . 'filter' );
$page = $page_param ? intval( $page_param ) : 1;
$filter = $filter_param ? $filter_param : 'all';

$data_context = [
    'config' => [
        'queryId'         => $queryId,
        'forcePageReload' => $forcePageReload,
    ],
    'queryContext' => [
        'page' => $page,
        'filter' => $filter,
    ],
    'queryResult' => [
        'totalLength' => 0, // TODO: set this when query is loaded
    ],
];
?>



<div
    <?php echo get_block_wrapper_attributes(); ?>
    data-wp-interactive="yay-bulk-order/bulk-order-form"
    <?php echo wp_interactivity_data_wp_context( $data_context ); ?>
    data-wp-init="callbacks.onRender"
>
    <button
        data-wp-text="state.currentPage"
    ></button>

    <button
        aria-controls="<?php echo esc_attr( $unique_id ); ?>"
    >
        <?php esc_html_e( 'Next Page', 'yay-bulk-order' ); ?>
    </button>

    <?php echo do_blocks( $content ); ?>

</div>
