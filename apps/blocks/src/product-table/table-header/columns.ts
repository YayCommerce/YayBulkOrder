import { __ } from '@wordpress/i18n';

/**
 * English labels written by save.tsx. Keep them unchanged: existing blocks
 * validate against this markup. The frontend renders translated labels from
 * render.php instead.
 */
export const COLUMN_LABELS: Record<string, string> = {
  'yay-bulk-order/product-table-column-product': 'Product',
  'yay-bulk-order/product-table-column-sku': 'SKU',
  'yay-bulk-order/product-table-column-description': 'Description',
  'yay-bulk-order/product-table-column-quantity': 'Quantity',
  'yay-bulk-order/product-table-column-subtotal': 'Subtotal',
  'yay-bulk-order/product-table-column-add-to-cart': 'Add to Cart',
  'yay-bulk-order/product-table-column-select': '',
};

/** Translated column label for the editor. Matches the labels in render.php. */
export function getColumnLabel(name: string): string {
  switch (name) {
    case 'yay-bulk-order/product-table-column-product':
      return __('Product', 'yay-bulk-order');
    case 'yay-bulk-order/product-table-column-sku':
      return __('SKU', 'yay-bulk-order');
    case 'yay-bulk-order/product-table-column-description':
      return __('Description', 'yay-bulk-order');
    case 'yay-bulk-order/product-table-column-quantity':
      return __('Quantity', 'yay-bulk-order');
    case 'yay-bulk-order/product-table-column-subtotal':
      return __('Subtotal', 'yay-bulk-order');
    case 'yay-bulk-order/product-table-column-add-to-cart':
      return __('Add to Cart', 'yay-bulk-order');
    default:
      return '';
  }
}

export const TABLE_COLUMNS_BLOCK_NAME = 'yay-bulk-order/product-table-columns';

export const DEFAULT_COLUMNS = Object.keys(COLUMN_LABELS);

const FIXED_COLUMN_TRACKS: Record<string, string> = {
  'yay-bulk-order/product-table-column-quantity': '104px',
  'yay-bulk-order/product-table-column-subtotal': '110px',
  'yay-bulk-order/product-table-column-add-to-cart': '150px',
  'yay-bulk-order/product-table-column-select': '56px',
};

const FLEXIBLE_COLUMN_MIN_WIDTH = '140px';

/** Builds a `grid-template-columns` value for the given (ordered) column block names. */
export function getGridTemplateColumns(columns: string[]): string {
  return columns.map((name) => FIXED_COLUMN_TRACKS[name] ?? `minmax(${FLEXIBLE_COLUMN_MIN_WIDTH}, 1fr)`).join(' ');
}

// `label` is set only by the shortcode (its own headings); render.php prefers it.
export type HeaderColumn = { name: string; className?: string; label?: string };
