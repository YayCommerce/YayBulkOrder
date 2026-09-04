<?php
/**
 * Shared Product Table shortcode markup.
 *
 * Emits the `yay-bulk-order/product-table-root` block tree from the normalized
 * shortcode attributes. Shared by product-table-archive.php and
 * product-table-default.php — the only difference between them is the default
 * `queryBy` when the shortcode doesn't specify one.
 *
 * @var array       $attrs                Normalized shortcode attributes.
 * @var string      $ybo_default_query_by Fallback query type ('all' or 'inherit').
 * @var object      $this                 ProductTableShortcode instance.
 * @package product-table
 */

defined( 'ABSPATH' ) || exit;

$ybo_default_query_by = $ybo_default_query_by ?? 'all';

$ybo_column_labels = $this->product_tables_service->get_block_labels();

// Columns
$ybo_columns_raw = $attrs['columns'];
if ( is_string( $ybo_columns_raw ) ) {
    $ybo_columns_raw = array_map( 'trim', explode( ',', $ybo_columns_raw ) );
}
$ybo_columns_raw = (array) $ybo_columns_raw;

$ybo_header_cells = '';
foreach ( $ybo_columns_raw as $ybo_slug ) {
    if ( isset( $ybo_column_labels[ $ybo_slug ] ) ) {
        $ybo_header_cells .= '<th>' . esc_html( $ybo_column_labels[ $ybo_slug ] ?? '' ) . '</th>';
    }
}

// Query
$ybo_query_by = $attrs['query_by'] ?? $ybo_default_query_by;

$ybo_query_type_map = $this->product_tables_service->get_query_type_map();
$ybo_query_type     = $ybo_query_type_map[ $ybo_query_by ]
    ?? $ybo_query_type_map[ $ybo_default_query_by ]
    ?? 'all-products';

$ybo_product_query = [ 'queryType' => $ybo_query_type ];
if ( 'by-category' === $ybo_query_type ) {
    $ybo_categories = $attrs['categories'] ?? [];
    if ( is_string( $ybo_categories ) ) {
        $ybo_categories = explode( ',', $ybo_categories );
    }
    $ybo_product_query['categoryIds'] = array_values(
        array_filter( array_map( 'absint', (array) $ybo_categories ) )
    );
}

$ybo_root_attrs = [
    'queryId'          => 1,
    'productQuery'     => $ybo_product_query,
    'hasSelectedQuery' => true,
];

$ybo_per_page = (int) $attrs['page_size'];
if ( $ybo_per_page > 0 ) {
    $ybo_root_attrs['query'] = [
        'perPage'  => $ybo_per_page,
        'postType' => 'product',
        'order'    => 'desc',
        'orderBy'  => 'date',
    ];
}

// Features
$ybo_has_filter     = filter_var( $attrs['has_filter'], FILTER_VALIDATE_BOOLEAN );
$ybo_has_search     = filter_var( $attrs['has_search'], FILTER_VALIDATE_BOOLEAN );
$ybo_has_pagination = filter_var( $attrs['has_pagination'], FILTER_VALIDATE_BOOLEAN );

// Render
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- static block markup / values escaped above.
?>
<!-- wp:yay-bulk-order/product-table-root <?php echo wp_json_encode( $ybo_root_attrs, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ); ?> -->
<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
<div class="wp-block-group">
<?php if ( $ybo_has_filter ) : ?>
<!-- wp:yay-bulk-order/product-table-filter /-->
<?php endif ?>
<?php if ( $ybo_has_search ) : ?>
<!-- wp:yay-bulk-order/product-table-search -->
<div class="wp-block-yay-bulk-order-product-table-search ybo-search"><input type="search" class="ybo-search__input" placeholder="Search products..." aria-label="Search products" data-wp-bind--value="context.tableState.filter.search" data-wp-on--input="actions.updateSearchKeyword" data-wp-on--keydown="actions.handleSearchKeydown"/><span class="ybo-search__icon" data-wp-bind--hidden="state.hasSearchKeyword" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"></circle><path d="M16 16L12.6 12.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></span><button type="button" class="ybo-search__clear" aria-label="Clear search" data-wp-bind--hidden="!state.hasSearchKeyword" data-wp-on--click="actions.clearSearch"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>
<!-- /wp:yay-bulk-order/product-table-search -->
<?php endif ?>
<!-- wp:yay-bulk-order/cart-summary /--></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ybo-filter-layout","layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group ybo-filter-layout">
<?php if ( $ybo_has_filter ) : ?>
<!-- wp:yay-bulk-order/product-table-filter-sidebar /-->
<?php endif ?>
<!-- wp:group {"className":"ybo-table-column"} -->
<div class="wp-block-group ybo-table-column"><!-- wp:yay-bulk-order/product-table -->
<table class="wp-block-yay-bulk-order-product-table"><!-- wp:yay-bulk-order/product-table-header <?php echo wp_json_encode( [ 'columns' => array_map( static fn( $slug ) => 'yay-bulk-order/product-table-column-' . $slug, $ybo_columns_raw ) ], JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ); ?> -->
<thead class="wp-block-yay-bulk-order-product-table-header" data-wp-init="callbacks.watchBackToTopVisibility"><tr><?php echo $ybo_header_cells; ?></tr></thead>
<!-- /wp:yay-bulk-order/product-table-header -->

<!-- wp:yay-bulk-order/product-table-columns -->
<?php foreach ( $ybo_columns_raw as $ybo_slug ) : ?>
    <?php echo '<!-- wp:yay-bulk-order/product-table-column-' . $ybo_slug . ' /-->'; ?>

<?php endforeach ?>
<!-- wp:yay-bulk-order/product-table-column-select /-->
<!-- /wp:yay-bulk-order/product-table-columns --></table>
<!-- /wp:yay-bulk-order/product-table -->

<!-- wp:yay-bulk-order/product-table-footer -->
<div class="wp-block-yay-bulk-order-product-table-footer">
<?php if ( $ybo_has_pagination ) : ?>
<!-- wp:yay-bulk-order/product-table-pagination /-->
<?php endif ?>
<!-- wp:yay-bulk-order/product-table-bulk-action /--></div>
<!-- /wp:yay-bulk-order/product-table-footer --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:yay-bulk-order/product-table-root -->
<?php // phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped ?>
