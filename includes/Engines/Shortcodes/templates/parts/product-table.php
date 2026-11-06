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
 * @var string      $ybod_default_query_by Fallback query type ('all' or 'inherit').
 * @var object      $this                 ProductTableShortcode instance.
 * @package product-table
 */

defined( 'ABSPATH' ) || exit;

use YayBulkOrder\Services\ProductTablesService;

$ybod_default_query_by = $ybod_default_query_by ?? 'all-products';

// Columns — normalized by ProductTableShortcode into [ slug, heading, responsive ] configs.
$ybod_columns           = (array) ( $attrs['columns'] ?? [] );
$ybod_column_slugs      = [];
$ybod_column_responsive = [];
$ybod_column_headings   = [];
$ybod_header_cells      = '';
foreach ( $ybod_columns as $ybod_column ) {
    $ybod_slug = sanitize_key( $ybod_column['slug'] ?? '' );
    if ( '' === $ybod_slug ) {
        continue;
    }
    $ybod_column_slugs[] = $ybod_slug;

    $ybod_heading                       = $ybod_column['heading'] ?? '';
    $ybod_column_headings[ $ybod_slug ] = $ybod_heading;
    $ybod_responsive = $ybod_column['responsive'] ?? 'always-show';
    if ( ! in_array( $ybod_responsive, ProductTablesService::RESPONSIVE_OPTIONS, true ) ) {
        $ybod_responsive = 'always-show';
    }

    $ybod_responsive_class               = ( 'always-show' !== $ybod_responsive ) ? 'ybod-' . $ybod_responsive : '';
    $ybod_column_responsive[ $ybod_slug ] = $ybod_responsive_class;
    $ybod_th_class                       = '' !== $ybod_responsive_class ? ' class="' . esc_attr( $ybod_responsive_class ) . '"' : '';

    $ybod_header_cells .= '<th' . $ybod_th_class . '>' . esc_html( $ybod_heading ) . '</th>';
}
$ybod_header_cells .= '<th></th>';

$ybod_header_columns = array_map(
    static function ( $ybod_slug ) use ( $ybod_column_responsive, $ybod_column_headings ) {
        $ybod_column = [
            'name'  => 'yay-bulk-order/product-table-column-' . $ybod_slug,
            'label' => $ybod_column_headings[ $ybod_slug ] ?? '',
        ];
        if ( ! empty( $ybod_column_responsive[ $ybod_slug ] ) ) {
            $ybod_column['className'] = $ybod_column_responsive[ $ybod_slug ];
        }
        return $ybod_column;
    },
    $ybod_column_slugs
);

$ybod_header_columns[] = [
    'name' => 'yay-bulk-order/product-table-column-select',
];

// Query
$ybod_query_by = $attrs['query_by'] ?? $ybod_default_query_by;
if ( ! in_array( $ybod_query_by, array_merge( ProductTablesService::QUERY_BY_OPTIONS, [ 'inherit', 'top-rated' ] ), true ) ) {
    $ybod_query_by = 'all-products';
}

$ybod_product_query = [ 'queryType' => $ybod_query_by ];
if ( 'by-category' === $ybod_query_by ) {
    $ybod_categories = $attrs['categories'] ?? [];
    if ( is_string( $ybod_categories ) ) {
        $ybod_categories = explode( ',', $ybod_categories );
    }
    $ybod_product_query['categoryIds'] = array_values(
        array_filter( array_map( 'absint', (array) $ybod_categories ) )
    );
}

if ( 'hand-picked' === $ybod_query_by ) {
    $ybod_products = $attrs['products'] ?? [];
    if ( is_string( $ybod_products ) ) {
        $ybod_products = explode( ',', $ybod_products );
    }
    $ybod_product_query['productIds'] = array_values(
        array_filter( array_map( 'absint', (array) $ybod_products ) )
    );
}

$ybod_has_pagination                 = filter_var( $attrs['has_pagination'], FILTER_VALIDATE_BOOLEAN );
$ybod_per_page                       = (int) $attrs['page_size'];
$ybod_product_query['hasPagination'] = $ybod_has_pagination;
if ( $ybod_per_page > 0 ) {
    $ybod_product_query['pageSize'] = $ybod_per_page;
}

$ybod_root_attrs = [
    'queryId'          => 1,
    'productQuery'     => $ybod_product_query,
    'hasSelectedQuery' => true,
];

// Features
$ybod_has_filter = filter_var( $attrs['has_filter'], FILTER_VALIDATE_BOOLEAN );
$ybod_has_search = filter_var( $attrs['has_search'], FILTER_VALIDATE_BOOLEAN );

// Render
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- static block markup / values escaped above.
?>
<!-- wp:yay-bulk-order/product-table-root <?php echo serialize_block_attributes( $ybod_root_attrs ); ?> -->
<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
<div class="wp-block-group">
<?php if ( $ybod_has_filter ) : ?>
<!-- wp:yay-bulk-order/product-table-filter /-->
<?php endif ?>
<?php if ( $ybod_has_search ) : ?>
<!-- wp:yay-bulk-order/product-table-search -->
<div class="wp-block-yay-bulk-order-product-table-search ybod-search"><input type="search" class="ybod-search__input" placeholder="Search products..." aria-label="Search products" data-wp-bind--value="context.tableState.filter.search" data-wp-on--input="actions.updateSearchKeyword" data-wp-on--keydown="actions.handleSearchKeydown"/><span class="ybod-search__icon" data-wp-bind--hidden="state.hasSearchKeyword" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"></circle><path d="M16 16L12.6 12.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></span><button type="button" class="ybod-search__clear" aria-label="Clear search" data-wp-bind--hidden="!state.hasSearchKeyword" data-wp-on--click="actions.clearSearch"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>
<!-- /wp:yay-bulk-order/product-table-search -->
<?php endif ?>
<!-- wp:yay-bulk-order/cart-summary /--></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ybod-filter-layout","layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group ybod-filter-layout">
<?php if ( $ybod_has_filter ) : ?>
<!-- wp:yay-bulk-order/product-table-filter-sidebar /-->
<?php endif ?>
<!-- wp:group {"className":"ybod-table-column"} -->
<div class="wp-block-group ybod-table-column"><!-- wp:yay-bulk-order/product-table -->
<table class="wp-block-yay-bulk-order-product-table"><!-- wp:yay-bulk-order/product-table-header <?php echo serialize_block_attributes( [ 'columns' => $ybod_header_columns ] ); ?> -->
<thead class="wp-block-yay-bulk-order-product-table-header" data-wp-init="callbacks.watchBackToTopVisibility"><tr><?php echo wp_kses( $ybod_header_cells, [ 'th' => [ 'class' => true ] ] ); ?></tr></thead>
<!-- /wp:yay-bulk-order/product-table-header -->

<!-- wp:yay-bulk-order/product-table-columns -->
<?php foreach ( $ybod_column_slugs as $ybod_slug ) : ?>
    <!-- wp:yay-bulk-order/product-table-column-<?php echo esc_attr( $ybod_slug ); ?> <?php echo ! empty( $ybod_column_responsive[ $ybod_slug ] ) ? serialize_block_attributes( [ 'className' => $ybod_column_responsive[ $ybod_slug ] ] ) : ''; ?> /-->
<?php endforeach ?>
<!-- wp:yay-bulk-order/product-table-column-select /-->
<!-- /wp:yay-bulk-order/product-table-columns --></table>
<!-- /wp:yay-bulk-order/product-table -->

<!-- wp:yay-bulk-order/product-table-footer -->
<div class="wp-block-yay-bulk-order-product-table-footer">
<?php if ( $ybod_has_pagination ) : ?>
<!-- wp:yay-bulk-order/product-table-pagination /-->
<?php endif ?>
<!-- wp:yay-bulk-order/product-table-bulk-action /--></div>
<!-- /wp:yay-bulk-order/product-table-footer --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:yay-bulk-order/product-table-root -->
<?php // phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped ?>
