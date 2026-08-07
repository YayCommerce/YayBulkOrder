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
// Store API credentials for add-to-cart (used by product-table interactivity store).
wp_interactivity_config(
	'yay-bulk-order/product-table',
	array(
		'restUrl' => esc_url_raw( rest_url() ),
		'nonce'   => wp_create_nonce( 'wc_store_api' ),
	)
);
$styles = $settings_service->get_styles();
$style_attr = '';
foreach ( $styles as $property => $value ) {
    $style_attr .= esc_attr( $property ) . ':' . esc_attr( $value ) . ';';
}

$query_id = $attributes['queryId'];

$page_param     = BlockHelper::get_page_param( $query_id );
$search_param   = BlockHelper::get_search_param( $query_id );
$category_param = BlockHelper::get_category_param( $query_id );

$data_context = [
    'formAttributes' => [
        'queryId'         => $query_id,
        'productQuery' => $attributes['productQuery']
    ],
    'tableState' => [
        // Cast to object so an empty selection serializes as `{}`, not `[]`,
        // keeping it a keyed dictionary (productId => SelectedRow) on the JS side.
        'select' => (object) [],
        'bulkAdding' => false,
        'cartNotice' => [
            'visible' => false,
            'totalFormatted' => '',
        ],
        // Seeded from the current URL so the search box, filter toggle and
        // pagination state stay in sync across a full page load and a
        // client-side (interactivity router) navigation alike.
        'filter' => [
            'categories' => $category_param,
            'search' => $search_param,
            'isOpen' => false,
        ],
        'pagination' => [
            'pageIndex' => max( 0, $page_param - 1 ),
            'pageSize' => $settings_service->get_settings()['general']['defaultPageSize'],
        ],
        'showBackToTop' => false,
    ],
];
?>

<div
    <?php echo get_block_wrapper_attributes(); ?>
    data-wp-interactive="yay-bulk-order/product-table"
    data-wp-router-region="yay-bulk-order/product-table"
    <?php echo wp_interactivity_data_wp_context( $data_context ); ?>
    data-wp-init="callbacks.onRender"
    data-wp-watch="callbacks.syncCartNoticeFromExternalChange"
    style="<?php echo $style_attr; ?>"
>

    <?php echo do_blocks( $content ); ?>

</div>
