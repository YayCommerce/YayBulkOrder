import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';

const toProductQuery = (table: ProductTableForm): Record<string, unknown> => {
  const { query, features } = table;
  const { hasPagination } = features;
  const pagination: { hasPagination: boolean; pageSize?: number } = {
    hasPagination: hasPagination,
  };

  if (hasPagination && (features?.pageSize ?? 0) > 0) {
    pagination.pageSize = features.pageSize;
  }

  const queryType = query.queryBy;
  if (queryType === 'by-categories') {
    const categoryIds = (query.categories ?? []).map(Number).filter((id) => Number.isFinite(id));
    return { queryType, categoryIds, ...pagination };
  }

  if (queryType === 'hand-picked') {
    const productIds = (query.products ?? []).map(Number).filter((id) => Number.isFinite(id));
    return { queryType, productIds, ...pagination };
  }

  return { queryType, ...pagination };
};

const escapeHtml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const responsiveClass = (responsive?: string): string =>
  responsive && responsive !== 'always-show' ? `ybo-${responsive}` : '';

const SEARCH_BLOCK = `<!-- wp:yay-bulk-order/product-table-search -->
<div class="wp-block-yay-bulk-order-product-table-search ybo-search"><input type="search" class="ybo-search__input" placeholder="Search products..." aria-label="Search products" data-wp-bind--value="context.tableState.filter.search" data-wp-on--input="actions.updateSearchKeyword" data-wp-on--keydown="actions.handleSearchKeydown"/><span class="ybo-search__icon" data-wp-bind--hidden="state.hasSearchKeyword" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"></circle><path d="M16 16L12.6 12.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></span><button type="button" class="ybo-search__clear" aria-label="Clear search" data-wp-bind--hidden="!state.hasSearchKeyword" data-wp-on--click="actions.clearSearch"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>
<!-- /wp:yay-bulk-order/product-table-search -->`;

export const makeBlockText = (table: ProductTableForm, tableId?: number): string => {
  const { features } = table;

  // Columns
  const enabledColumns = table.columns.filter((col) => col.enabled);

  const headerCells = [
    ...enabledColumns.map((col) => {
      const cls = responsiveClass(col.responsive);
      return `<th${cls ? ` class="${cls}"` : ''}>${escapeHtml(col.heading)}</th>`;
    }),
    '<th></th>',
  ].join('');

  const columnBlocks = [
    ...enabledColumns.map((col) => {
      const cls = responsiveClass(col.responsive);
      const attrs = cls ? `${JSON.stringify({ className: cls })}` : '';
      return `<!-- wp:yay-bulk-order/product-table-column-${col.slug} ${attrs} /-->`;
    }),
    '<!-- wp:yay-bulk-order/product-table-column-select /-->',
  ].join('\n\n');

  const headerColumns = [
    ...enabledColumns.map((col) => {
      const cls = responsiveClass(col.responsive);
      return cls
        ? { name: `yay-bulk-order/product-table-column-${col.slug}`, className: cls }
        : { name: `yay-bulk-order/product-table-column-${col.slug}` };
    }),
    { name: 'yay-bulk-order/product-table-column-select' },
  ];
  const headerAttrs = JSON.stringify({ columns: headerColumns });

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
    queryId: tableId && tableId > 0 ? tableId : Math.floor(Math.random() * 1_000_000),
    ...{ productQuery: toProductQuery(table) },
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

export const makeShortcodeWithId = (tableId: number) => `[ybo-product-table id=${tableId}]`;

export const makeShortcodeWithTable = (table: ProductTableForm) => {
  const cols = table.columns
    .filter((c) => c.enabled)
    .map((c) => c.slug + '|' + c.heading + '|' + c.responsive)
    .join(',');
  const hasSearch = table.features.hasSearch ? 'true' : 'false';
  const hasFilter = table.features.hasFilter ? 'true' : 'false';
  const hasPagination = table.features.hasPagination ? 'true' : 'false';
  const pageSize = table.features.pageSize ? table.features.pageSize : 0;
  const queryBy = table.query.queryBy;
  let queryStr;
  if (queryBy === 'by-categories') {
    queryStr = `query_by="${queryBy}" categories="${table.query.categories?.join(',')}"`;
  } else if (queryBy === 'hand-picked') {
    queryStr = `query_by="${queryBy}" products="${table.query.products?.join(',')}"`;
  } else {
    queryStr = `query_by="${queryBy}"`;
  }

  return `[ybo-product-table ${queryStr} columns="${cols}" has_filter="${hasFilter}" has_search="${hasSearch}" has_pagination="${hasPagination}" ${hasPagination && pageSize > 0 ? 'page_size=' + pageSize : ''}]`;
};
