import { ProductQuery } from '@yay-bulk-order/product-table-store';
import { __ } from '@wordpress/i18n';
import { category, check, grid, percent, starFilled, starHalf } from '@wordpress/icons';

export type QueryTypeOption = {
  queryType: ProductQuery['queryType'];
  label: string;
  icon: JSX.Element;
  /** Attributes merged into `productQuery` when this option is picked. */
  defaultQuery: ProductQuery;
};

export const ALL_PRODUCTS_QUERY: ProductQuery = { queryType: 'all-products' };

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
  },
  {
    queryType: 'on-sale',
    label: __('On Sale Products', 'yay-bulk-order'),
    icon: percent,
    defaultQuery: { queryType: 'on-sale' },
  },
  {
    queryType: 'top-rated',
    label: __('Top Rated Products', 'yay-bulk-order'),
    icon: starHalf,
    defaultQuery: { queryType: 'top-rated' },
  },
  {
    queryType: 'hand-picked',
    label: __('Hand-Picked Products', 'yay-bulk-order'),
    icon: check,
    defaultQuery: { queryType: 'hand-picked', productIds: [] },
  },
  {
    queryType: 'by-category',
    label: __('Products by Category', 'yay-bulk-order'),
    icon: category,
    defaultQuery: { queryType: 'by-category', categoryIds: [] },
  },
];

export const ALL_PRODUCTS_OPTION: QueryTypeOption = {
  queryType: 'all-products',
  label: __('All Products', 'yay-bulk-order'),
  icon: grid,
  defaultQuery: ALL_PRODUCTS_QUERY,
};
