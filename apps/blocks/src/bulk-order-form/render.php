<?php
/**
 * @var array{queryId: number, forcePageReload: boolean} $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */
use YayBulkOrder\Services\SettingsService;
$settings_service = SettingsService::get_instance();
$settings = $settings_service->get_settings();

wp_interactivity_config('yay-bulk-order/bulk-order-form', [
    'settings'     => [
        'defaultCartQuantity' => (int) $settings['general']['defaultCartQuantity'],
        'styles'              => [
            'colors'       => $settings['styles']['colors'],
            'borderRadius' => $settings['styles']['borderRadius'],
        ],
    ],
]);

wp_interactivity_state(
    'yay-bulk-order/bulk-order-form',
    [
        'isBlockTheme' => wp_is_block_theme(),
        'pageSize'     => 5,
    ]
);

$queryId = $attributes['queryId'];
$forcePageReload = $attributes['forcePageReload'];
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
    data-wp-router-region="yay-bulk-order/bulk-order-form"
    <?php echo wp_interactivity_data_wp_context( $data_context ); ?>
    data-wp-init="callbacks.onRender"
>

    <?php echo do_blocks( $content ); ?>

</div>
