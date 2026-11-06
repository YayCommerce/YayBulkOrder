<?php
/**
 * @var array{queryId: int, forcePageReload: boolean} $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use YayBulkOrder\Services\ProductQueryService;
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
		'messages' => array(
			'addToCartFailed' => __( 'Could not add the items to the cart. Please try again.', 'yay-bulk-order' ),
			'rateLimited'     => __( 'Too many requests. Please wait and try again.', 'yay-bulk-order' ),
		),
		'labels' => array(
			'addMore'          => __( 'Add more', 'yay-bulk-order' ),
			'adding'           => __( 'Adding...', 'yay-bulk-order' ),
			'addSelected'      => __( 'Add selected items to cart', 'yay-bulk-order' ),
			/* translators: %d: total quantity of the selected items. */
			'addSelectedCount' => __( 'Add selected items to cart (%d)', 'yay-bulk-order' ),
			/* translators: %s: formatted cart total. */
			'viewCart'         => __( 'View cart | %s', 'yay-bulk-order' ),
			/* translators: %s: formatted lowest price of a variable product. */
			'priceFrom'        => __( 'From %s', 'yay-bulk-order' ),
			'viewOptions'      => __( 'View options', 'yay-bulk-order' ),
			'hideOptions'      => __( 'Hide options', 'yay-bulk-order' ),
		),
	)
);
$styles = $settings_service->get_styles();
$style_attr = '';
foreach ( $styles as $property => $value ) {
    $style_attr .= $property . ':' . $value . ';';
}

$query_id = $attributes['queryId'];

// Whether the "select" column (checkboxes) is still part of the table's
// column composition — the user can remove it in the editor, in which case
// the bulk-action button has nothing to act on and shouldn't render at all.
$has_select_column = BlockHelper::inner_blocks_contain(
    $block->parsed_block['innerBlocks'] ?? array(),
    'yay-bulk-order/product-table-column-select'
);

$page_param     = BlockHelper::get_page_param( $query_id );
$search_param   = BlockHelper::get_search_param( $query_id );
$category_param = BlockHelper::get_category_param( $query_id );
$min_price_param = BlockHelper::get_min_price_param( $query_id );
$max_price_param = BlockHelper::get_max_price_param( $query_id );
$rating_param   = BlockHelper::get_rating_param( $query_id );
$tags_param     = BlockHelper::get_tags_param( $query_id );

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
        'cartError' => [
            'messages' => [],
        ],
        // Seeded from the current URL so the search box, filter toggle and
        // pagination state stay in sync across a full page load and a
        // client-side (interactivity router) navigation alike.
        'filter' => [
            'categories' => $category_param,
            'tags' => $tags_param,
            'search' => $search_param,
            'isOpen' => false,
            // Kept as strings — see the matching note on ProductTableContext
            // in productTable.type.ts (assigning `null` to an input's DOM
            // `.value` renders the literal text "null", not empty).
            'priceRange' => [
                'min' => null !== $min_price_param ? (string) $min_price_param : '',
                'max' => null !== $max_price_param ? (string) $max_price_param : '',
            ],
            'rating' => $rating_param,
        ],
        'pagination' => [
            'pageIndex' => max( 0, $page_param - 1 ),
            'pageSize' => $settings_service->get_settings()['general']['defaultPageSize'],
        ],
        'showBackToTop' => false,
        'isTableLoading' => false,
        'bulkActionOutOfView' => false,
        'hasSelectColumn' => $has_select_column,
        // Cast to object for the same `{}` (not `[]`) reason as `select` above.
        'expandedProducts' => (object) [],
    ],
];
?>

<div
    <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    data-wp-interactive="yay-bulk-order/product-table"
    data-wp-router-region="yay-bulk-order/product-table-<?php echo esc_attr( $query_id ); ?>"
    <?php echo wp_interactivity_data_wp_context( $data_context ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    data-wp-init="callbacks.onRender"
    data-wp-watch="callbacks.syncCartNoticeFromExternalChange"
    style="<?php echo esc_attr( $style_attr ); ?>"
>

    <?php echo do_blocks( $content ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

    <?php
    // A table with pagination off has no pagination block, but it still needs
    // page links when it has more products than the unpaginated page size.
    if ( false === ( $attributes['productQuery']['hasPagination'] ?? null ) && false === strpos( $content, 'ybo-pagination' ) ) {
        $pagination_block = new WP_Block(
            array(
                'blockName'    => 'yay-bulk-order/product-table-pagination',
                'attrs'        => array(),
                'innerBlocks'  => array(),
                'innerHTML'    => '',
                'innerContent' => array(),
            ),
            array(
                'queryId'      => $attributes['queryId'],
                'query'        => $attributes['query'],
                'productQuery' => $attributes['productQuery'],
            )
        );

        if ( ProductQueryService::get_instance()->get_pagination_info( $pagination_block )['totalPages'] > 1 ) {
            echo wp_kses_post( $pagination_block->render() );
        }
    }
    ?>

    <div
        class="ybo-table-loading-overlay"
        data-wp-bind--hidden="!state.isTableLoading"
        aria-hidden="true"
    >
        <span class="ybo-table-loading-overlay__spinner"></span>
    </div>

</div>
