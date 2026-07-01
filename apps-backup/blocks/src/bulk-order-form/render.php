<?php
/**
 * @var array{queryId: int, forcePageReload: boolean} $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */
use YayBulkOrder\Services\SettingsService;
use YayBulkOrder\Utils\BlockHelper;

$settings_service = SettingsService::get_instance();
$set_config       = $settings_service->get_config();

$config     = wp_interactivity_config( 'yay-bulk-order/bulk-order-form', $set_config );
$styles     = $settings_service->get_styles( $config['settings']['styles'] );
$style_attr = '';
foreach ( $styles as $property => $value ) {
    $style_attr .= esc_attr( $property ) . ':' . esc_attr( $value ) . ';';
}

wp_interactivity_state(
    'yay-bulk-order/bulk-order-form',
    [ 'noop' => true ]
);

$query_id          = $attributes['queryId'];
$force_page_reload = $attributes['forcePageReload'];

$page_param   = BlockHelper::get_page_param( $query_id );
$filter_param = BlockHelper::get_filter_param( $query_id );

$data_context = [
    'formAttributes' => [
        'queryId'         => $query_id,
        'forcePageReload' => $force_page_reload,
    ],
    'queryContext'   => [
        'page'   => $page_param,
        'filter' => $filter_param,
    ],
    'queryResult'    => [
        'totalLength' => 0,
    // TODO: set this when query is loaded
    ],
];
?>

<div
    <?php echo get_block_wrapper_attributes(); ?>
    data-wp-interactive="yay-bulk-order/bulk-order-form"
    data-wp-router-region="yay-bulk-order/bulk-order-form"
    <?php echo wp_interactivity_data_wp_context( $data_context ); ?>
    data-wp-init="callbacks.onRender"
    style="<?php echo $style_attr; ?>"
>

    <?php echo do_blocks( $content ); ?>

</div>
