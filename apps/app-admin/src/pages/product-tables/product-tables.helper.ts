import { ProductTable, ProductTableColumn } from '@yay-bulk-order/common/src/schemas';
import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';

const SELECT_COLUMN_BLOCK = 'yay-bulk-order/product-table-column-select';

const columnBlockName = (slug: ProductTableColumn['slug']): string => `yay-bulk-order/product-table-column-${slug}`;

const PRODUCT_QUERY_TYPE: Record<ProductTable['query']['queryBy'], string> = {
  all: 'all-products',
  categories: 'by-category',
  featured: 'featured',
  sale: 'on-sale',
};

const toProductQuery = (query: ProductTable['query']): Record<string, unknown> => {
  const queryType = PRODUCT_QUERY_TYPE[query.queryBy];
  if (query.queryBy === 'categories') {
    const categoryIds = (query.categories ?? []).map(Number).filter((id) => Number.isFinite(id));
    return { queryType, categoryIds };
  }
  return { queryType };
};

const escapeHtml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SEARCH_BLOCK = `<!-- wp:yay-bulk-order/product-table-search -->
<div class="wp-block-yay-bulk-order-product-table-search ybo-search"><input type="search" class="ybo-search__input" placeholder="Search products..." aria-label="Search products" data-wp-bind--value="context.tableState.filter.search" data-wp-on--input="actions.updateSearchKeyword" data-wp-on--keydown="actions.handleSearchKeydown"/><span class="ybo-search__icon" data-wp-bind--hidden="state.hasSearchKeyword" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"></circle><path d="M16 16L12.6 12.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></span><button type="button" class="ybo-search__clear" aria-label="Clear search" data-wp-bind--hidden="!state.hasSearchKeyword" data-wp-on--click="actions.clearSearch"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>
<!-- /wp:yay-bulk-order/product-table-search -->`;

export const makeBlockText = (table: ProductTableForm): string => {
  const { query, features } = table;

  // Columns
  const enabledColumns = table.columns.filter((col) => col.enabled);

  const columnBlockNames = [...enabledColumns.map((col) => columnBlockName(col.slug)), SELECT_COLUMN_BLOCK];

  const headerCells = [...enabledColumns.map((col) => `<th>${escapeHtml(col.heading)}</th>`), '<th></th>'].join('');

  const columnBlocks = columnBlockNames.map((name) => `<!-- wp:${name} /-->`).join('\n\n');

  const headerAttrs = JSON.stringify({ columns: columnBlockNames });

  // Features
  const toolbarBlocks = [
    features.hasFilter && '<!-- wp:yay-bulk-order/product-table-filter /-->',
    features.hasSearch && SEARCH_BLOCK,
    '<!-- wp:yay-bulk-order/cart-summary /-->',
  ]
    .filter(Boolean)
    .join('\n\n');

  const filterSidebar = features.hasFilter ? '<!-- wp:yay-bulk-order/product-table-filter-sidebar /-->\n\n' : '';

  const pagination = features.hasPagination ? '<!-- wp:yay-bulk-order/product-table-pagination /-->\n\n' : '';

  // Query
  const rootAttrs = JSON.stringify({
    queryId: table.id,
    ...(query.queryBy === 'all' ? {} : { productQuery: toProductQuery(query) }),
    hasSelectedQuery: true,
  });

  // Final Block text
  return `<!-- wp:yay-bulk-order/product-table-root ${rootAttrs} -->
<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
<div class="wp-block-group">${toolbarBlocks}</div>
<!-- /wp:group -->

<!-- wp:group {"className":"ybo-filter-layout","layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group ybo-filter-layout">${filterSidebar}<!-- wp:group {"className":"ybo-table-column"} -->
<div class="wp-block-group ybo-table-column"><!-- wp:yay-bulk-order/product-table -->
<table class="wp-block-yay-bulk-order-product-table"><!-- wp:yay-bulk-order/product-table-header ${headerAttrs} -->
<thead class="wp-block-yay-bulk-order-product-table-header" data-wp-init="callbacks.watchBackToTopVisibility"><tr>${headerCells}</tr></thead>
<!-- /wp:yay-bulk-order/product-table-header -->

<!-- wp:yay-bulk-order/product-table-columns -->
${columnBlocks}
<!-- /wp:yay-bulk-order/product-table-columns --></table>
<!-- /wp:yay-bulk-order/product-table -->

<!-- wp:yay-bulk-order/product-table-footer -->
<div class="wp-block-yay-bulk-order-product-table-footer">${pagination}<!-- wp:yay-bulk-order/product-table-bulk-action /--></div>
<!-- /wp:yay-bulk-order/product-table-footer --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:yay-bulk-order/product-table-root -->`;
};
