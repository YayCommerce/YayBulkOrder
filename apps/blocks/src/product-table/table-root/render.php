<?php
/**
 * @var array{queryId: int, forcePageReload: boolean} $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */
use YayBulkOrder\Services\LocalizeService;
use YayBulkOrder\Services\SettingsService;
use YayBulkOrder\Utils\BlockHelper;

$localize_service = LocalizeService::get_instance();
$settings_service = SettingsService::get_instance();

$global_config = $localize_service->get_global_config();
$config = wp_interactivity_config('yay-bulk-order/global-config', $global_config);

$styles = $settings_service->get_styles();
$style_attr = '';
foreach ( $styles as $property => $value ) {
    $style_attr .= esc_attr( $property ) . ':' . esc_attr( $value ) . ';';
}

$query_id = $attributes['queryId'];

$page_param = BlockHelper::get_page_param( $query_id );
$filter_param = BlockHelper::get_filter_param( $query_id );

$data_context = [
    'formAttributes' => [
        'queryId'         => $query_id,
        'productQuery' => $attributes['productQuery']
    ],
    'tableState' => [
        'select' => [ 'noop' => false ],
        'filter' => [ 'noop' => false ],
        'pagination' => [
            'pageIndex' => 0,
            'pageSize' => 10,
        ],
    ],
];
?>

<div
    <?php echo get_block_wrapper_attributes(); ?>
    data-wp-interactive="yay-bulk-order/product-table"
    data-wp-router-region="yay-bulk-order/product-table"
    <?php echo wp_interactivity_data_wp_context( $data_context ); ?>
    data-wp-init="callbacks.onRender"
    style="<?php echo $style_attr; ?>"
>

    <?php echo do_blocks( $content ); ?>

</div>
