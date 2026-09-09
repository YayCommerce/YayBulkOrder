import { Meta } from '@yay-bulk-order/common/src/schemas';
import { ProductQuery } from '@yay-bulk-order/product-table-store';
import { __ } from '@wordpress/i18n';
import { category, check, grid, percent, starFilled, store } from '@wordpress/icons';

export type QueryTypeOption = {
  queryType: ProductQuery['queryType'];
  label: string;
  icon: JSX.Element;
  /** Attributes merged into `productQuery` when this option is picked. */
  defaultQuery: ProductQuery;
  /** Lite can only ever pick All Products — every other collection is Pro-only. */
  requiresPro?: boolean;
};

/** Sales page linked from the "Pro" badge on locked, Lite-only collections. */
export const UPGRADE_TO_PRO_URL = 'https://yaycommerce.com/yaybulkorder/';

export function isProPlan(): boolean {
  const meta = (window as Window & { yayBulkOrderMeta?: Meta }).yayBulkOrderMeta;
  return meta?.bulkOrderMeta?.isPro ?? false;
}

export const ALL_PRODUCTS_QUERY: ProductQuery = { queryType: 'all-products' };

export const INHERIT_QUERY: ProductQuery = { queryType: 'inherit' };

/** Auto-applied when inserting on Shop / product archive templates. */
export const INHERIT_OPTION: QueryTypeOption = {
  queryType: 'inherit',
  label: __('Inherit from archive', 'yay-bulk-order'),
  icon: store,
  defaultQuery: INHERIT_QUERY,
};

/**
 * Collections offered by the insertion placeholder, mirroring core's
 * Product Collection block chooser but limited to the query types the
 * product table actually supports end to end.
 */
export const QUERY_TYPE_OPTIONS: QueryTypeOption[] = [
  {
    queryType: 'featured',
    label: __('Featured Products', 'yay-bulk-order'),
    icon: starFilled,
    defaultQuery: { queryType: 'featured' },
    requiresPro: true,
  },
  {
    queryType: 'on-sale',
    label: __('On Sale Products', 'yay-bulk-order'),
    icon: percent,
    defaultQuery: { queryType: 'on-sale' },
    requiresPro: true,
  },
  {
    queryType: 'hand-picked',
    label: __('Hand-Picked Products', 'yay-bulk-order'),
    icon: check,
    defaultQuery: { queryType: 'hand-picked', productIds: [] },
    requiresPro: true,
  },
  {
    queryType: 'by-category',
    label: __('Products by Category', 'yay-bulk-order'),
    icon: category,
    defaultQuery: { queryType: 'by-category', categoryIds: [] },
    requiresPro: true,
  },
];

export const ALL_PRODUCTS_OPTION: QueryTypeOption = {
  queryType: 'all-products',
  label: __('All Products', 'yay-bulk-order'),
  icon: grid,
  defaultQuery: ALL_PRODUCTS_QUERY,
};
