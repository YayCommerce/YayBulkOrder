<?php
/**
 * @var array{productId: int, hasSelectedProduct: bool} $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */
use YayBulkOrder\Pro\Services\VariantTableService;
use YayBulkOrder\Services\LocalizeService;
use YayBulkOrder\Services\SettingsService;

$variant_table_service = VariantTableService::get_instance();
// Own attribute isn't part of `$block->context` yet (context only carries
// what ancestors provide) — merge it in under the same key this block
// forwards to its descendants via `providesContext`, so the resolution
// logic is identical here and in variant-table-columns/render.php.
$context = array_merge(
    (array) $block->context,
    [ VariantTableService::CONTEXT_PRODUCT_ID_KEY => $attributes['productId'] ]
);
$product = $variant_table_service->resolve_product( $context );

// This block's editor UI (edit.tsx) never calls this PHP render — it renders
// its own placeholder/picker client-side. So this only ever runs for a real
// page view, where a "not a variable product" notice is noise for every
// visitor, admins included: render nothing rather than a visible placeholder.
if ( ! $product instanceof WC_Product_Variable ) {
    return;
}

$localize_service = LocalizeService::get_instance();
$settings_service = SettingsService::get_instance();

$global_config = $localize_service->get_global_config();
wp_interactivity_config( 'yay-bulk-order/global-config', $global_config );
// Store API credentials for add-to-cart. Shared with the Product Table
// block's interactivity store — both are plain WooCommerce Store API
// requests, so there's no reason to duplicate the config namespace.
wp_interactivity_config(
	'yay-bulk-order/product-table',
	array(
		'restUrl' => esc_url_raw( rest_url() ),
		'nonce'   => wp_create_nonce( 'wc_store_api' ),
		'messages' => array(
			'addToCartFailed' => __( 'Could not add the items to the cart. Please try again.', 'yay-bulk-order' ),
			'rateLimited'     => __( 'Too many requests. Please wait and try again.', 'yay-bulk-order' ),
		),
	)
);

wp_interactivity_config(
	'yay-bulk-order/variant-table',
	array(
		'labels' => array(
			'adding'         => __( 'Adding...', 'yay-bulk-order' ),
			'addToCart'      => __( 'Add to cart', 'yay-bulk-order' ),
			/* translators: %d: total quantity of the selected variations. */
			'addToCartCount' => __( 'Add to cart (%d)', 'yay-bulk-order' ),
			/* translators: %s: formatted cart total. */
			'viewCart'       => __( 'View cart | %s', 'yay-bulk-order' ),
		),
	)
);

$styles = $settings_service->get_styles();
$style_attr = '';
foreach ( $styles as $property => $value ) {
    $style_attr .= esc_attr( $property ) . ':' . esc_attr( $value ) . ';';
}

$data_context = [
    'formAttributes' => [
        'productId' => $product->get_id(),
    ],
    'tableState' => [
        // Cast to object so an empty selection serializes as `{}`, not `[]`.
        'select' => (object) [],
        'bulkAdding' => false,
        'cartNotice' => [
            'visible' => false,
            'totalFormatted' => '',
        ],
        'cartError' => [
            'messages' => [],
        ],
        'bulkActionOutOfView' => false,
    ],
];
?>

<div
    <?php echo get_block_wrapper_attributes(); ?>
    data-wp-interactive="yay-bulk-order/variant-table"
    <?php echo wp_interactivity_data_wp_context( $data_context ); ?>
    data-wp-watch="callbacks.syncCartNoticeFromExternalChange"
    style="<?php echo $style_attr; ?>"
>

    <?php echo do_blocks( $content ); ?>

</div>
