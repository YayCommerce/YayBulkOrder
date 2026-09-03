import { ProductTable, ProductTableColumn, TablePrebuildTemplate } from '@yay-bulk-order/common/src/schemas';
import { __ } from '@wordpress/i18n';

export type BuilderSteps = 'prebuild' | 'products' | 'columns' | 'features' | 'publish';
export type BuilderStepsProps = {
  setSteps: (e: BuilderSteps) => void;
};

export const REQUIRED_PRODUCT_TABLE_COLS: ProductTableColumn['slug'][] = ['cart'];

export const getColumnsBySlugs = (slugs: ProductTableColumn['slug'][]) => {
  const wanted = new Set<ProductTableColumn['slug']>([...slugs, ...REQUIRED_PRODUCT_TABLE_COLS]);
  return ALL_PRODUCT_TABLE_COLS.filter((col) => wanted.has(col.slug));
};

export const ALL_PRODUCT_TABLE_COLS: ProductTable['columns'] = [
  {
    slug: 'product',
    heading: __('Product', 'yay-bulk-order'),
    enabled: true,
    responsive: 'always-show',
  },
  {
    slug: 'sku',
    heading: __('SKU', 'yay-bulk-order'),
    enabled: true,
    responsive: 'hide-on-mobile',
  },
  {
    slug: 'price',
    heading: __('Price', 'yay-bulk-order'),
    enabled: true,
    responsive: 'always-show',
  },
  {
    slug: 'quantity',
    heading: __('Quantity', 'yay-bulk-order'),
    enabled: true,
    responsive: 'always-show',
  },
  {
    slug: 'subtotal',
    heading: __('Subtotal', 'yay-bulk-order'),
    enabled: true,
    responsive: 'hide-on-mobile',
  },
  {
    slug: 'summary',
    heading: __('Summary', 'yay-bulk-order'),
    enabled: true,
    responsive: 'hide-on-tablet',
  },
  {
    slug: 'cart',
    heading: __('Add to Cart', 'yay-bulk-order'),
    enabled: true,
    responsive: 'always-show',
  },
];

export const PREBUILD_TEMPLATES: TablePrebuildTemplate[] = [
  {
    slug: 'full-featured',
    title: __('Full Featured Table', 'yay-bulk-order'),
    desc: __('All columns, with performant filters and pagination', 'yay-bulk-order'),
    data: {
      query: {
        queryBy: 'all',
      },
      title: __('Full Featured Table', 'yay-bulk-order'),
      columns: ALL_PRODUCT_TABLE_COLS,
      features: {
        hasFilter: true,
        hasSearch: true,
        hasPagination: true,
      },
    },
  },
  {
    slug: 'some-categories',
    title: __('Some Categories Table', 'yay-bulk-order'),
    desc: __('Show all products from some selected categories.', 'yay-bulk-order'),
    data: {
      query: {
        queryBy: 'categories',
        categories: [],
      },
      title: __('Some Categories Table', 'yay-bulk-order'),
      columns: getColumnsBySlugs(['product', 'price', 'quantity', 'subtotal', 'cart']),
      features: {
        hasFilter: false,
        hasSearch: true,
        hasPagination: false,
      },
    },
  },
  {
    slug: 'simple',
    title: __('Simple Table', 'yay-bulk-order'),
    desc: __('Only 4 essential columns, fit for small space', 'yay-bulk-order'),
    data: {
      query: {
        queryBy: 'all',
      },
      title: __('Simple Table', 'yay-bulk-order'),
      columns: getColumnsBySlugs(['product', 'quantity', 'subtotal', 'cart']),
      features: {
        hasFilter: true,
        hasSearch: false,
        hasPagination: true,
      },
    },
  },
];
