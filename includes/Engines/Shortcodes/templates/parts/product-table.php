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

use YayBulkOrder\Services\ProductTablesService;

$ybo_default_query_by = $ybo_default_query_by ?? 'all-products';

// Columns — normalized by ProductTableShortcode into [ slug, heading, responsive ] configs.
$ybo_columns           = (array) ( $attrs['columns'] ?? [] );
$ybo_column_slugs      = [];
$ybo_column_responsive = [];
$ybo_column_headings   = [];
$ybo_header_cells      = '';
foreach ( $ybo_columns as $ybo_column ) {
    $ybo_slug = sanitize_key( $ybo_column['slug'] ?? '' );
    if ( '' === $ybo_slug ) {
        continue;
    }
    $ybo_column_slugs[] = $ybo_slug;

    $ybo_heading                       = $ybo_column['heading'] ?? '';
    $ybo_column_headings[ $ybo_slug ] = $ybo_heading;
    $ybo_responsive = $ybo_column['responsive'] ?? 'always-show';
    if ( ! in_array( $ybo_responsive, ProductTablesService::RESPONSIVE_OPTIONS, true ) ) {
        $ybo_responsive = 'always-show';
    }

    $ybo_responsive_class               = ( 'always-show' !== $ybo_responsive ) ? 'ybo-' . $ybo_responsive : '';
    $ybo_column_responsive[ $ybo_slug ] = $ybo_responsive_class;
    $ybo_th_class                       = '' !== $ybo_responsive_class ? ' class="' . esc_attr( $ybo_responsive_class ) . '"' : '';

    $ybo_header_cells .= '<th' . $ybo_th_class . '>' . esc_html( $ybo_heading ) . '</th>';
}
$ybo_header_cells .= '<th></th>';

$ybo_header_columns = array_map(
    static function ( $ybo_slug ) use ( $ybo_column_responsive, $ybo_column_headings ) {
        $ybo_column = [
            'name'  => 'yay-bulk-order/product-table-column-' . $ybo_slug,
            'label' => $ybo_column_headings[ $ybo_slug ] ?? '',
        ];
        if ( ! empty( $ybo_column_responsive[ $ybo_slug ] ) ) {
            $ybo_column['className'] = $ybo_column_responsive[ $ybo_slug ];
        }
        return $ybo_column;
    },
    $ybo_column_slugs
);

$ybo_header_columns[] = [
    'name' => 'yay-bulk-order/product-table-column-select',
];

// Query
$ybo_query_by = $attrs['query_by'] ?? $ybo_default_query_by;
if ( ! in_array( $ybo_query_by, array_merge( ProductTablesService::QUERY_BY_OPTIONS, [ 'inherit', 'top-rated' ] ), true ) ) {
    $ybo_query_by = 'all-products';
}

$ybo_product_query = [ 'queryType' => $ybo_query_by ];
if ( 'by-category' === $ybo_query_by ) {
    $ybo_categories = $attrs['categories'] ?? [];
    if ( is_string( $ybo_categories ) ) {
        $ybo_categories = explode( ',', $ybo_categories );
    }
    $ybo_product_query['categoryIds'] = array_values(
        array_filter( array_map( 'absint', (array) $ybo_categories ) )
    );
}

if ( 'hand-picked' === $ybo_query_by ) {
    $ybo_products = $attrs['products'] ?? [];
    if ( is_string( $ybo_products ) ) {
        $ybo_products = explode( ',', $ybo_products );
    }
    $ybo_product_query['productIds'] = array_values(
        array_filter( array_map( 'absint', (array) $ybo_products ) )
    );
}

$ybo_has_pagination                 = filter_var( $attrs['has_pagination'], FILTER_VALIDATE_BOOLEAN );
$ybo_per_page                       = (int) $attrs['page_size'];
$ybo_product_query['hasPagination'] = $ybo_has_pagination;
if ( $ybo_per_page > 0 ) {
    $ybo_product_query['pageSize'] = $ybo_per_page;
}

$ybo_root_attrs = [
    'queryId'          => 1,
    'productQuery'     => $ybo_product_query,
    'hasSelectedQuery' => true,
];

// Features
$ybo_has_filter = filter_var( $attrs['has_filter'], FILTER_VALIDATE_BOOLEAN );
$ybo_has_search = filter_var( $attrs['has_search'], FILTER_VALIDATE_BOOLEAN );

// Render
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- static block markup / values escaped above.
?>
<!-- wp:yay-bulk-order/product-table-root <?php echo serialize_block_attributes( $ybo_root_attrs ); ?> -->
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
<table class="wp-block-yay-bulk-order-product-table"><!-- wp:yay-bulk-order/product-table-header <?php echo serialize_block_attributes( [ 'columns' => $ybo_header_columns ] ); ?> -->
<thead class="wp-block-yay-bulk-order-product-table-header" data-wp-init="callbacks.watchBackToTopVisibility"><tr><?php echo wp_kses( $ybo_header_cells, [ 'th' => [ 'class' => true ] ] ); ?></tr></thead>
<!-- /wp:yay-bulk-order/product-table-header -->

<!-- wp:yay-bulk-order/product-table-columns -->
<?php foreach ( $ybo_column_slugs as $ybo_slug ) : ?>
    <!-- wp:yay-bulk-order/product-table-column-<?php echo esc_attr( $ybo_slug ); ?> <?php echo ! empty( $ybo_column_responsive[ $ybo_slug ] ) ? serialize_block_attributes( [ 'className' => $ybo_column_responsive[ $ybo_slug ] ] ) : ''; ?> /-->
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
