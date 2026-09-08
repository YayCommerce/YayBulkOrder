export const COLUMN_LABELS: Record<string, string> = {
  'yay-bulk-order/variant-table-column-product': 'Product',
  'yay-bulk-order/variant-table-column-sku': 'SKU',
  'yay-bulk-order/variant-table-column-description': 'Description',
  'yay-bulk-order/variant-table-column-quantity': 'Qty',
  'yay-bulk-order/variant-table-column-subtotal': 'Subtotal',
  'yay-bulk-order/variant-table-column-select': '',
};

export const TABLE_COLUMNS_BLOCK_NAME = 'yay-bulk-order/variant-table-columns';

export const DEFAULT_COLUMNS = Object.keys(COLUMN_LABELS);

const FIXED_COLUMN_TRACKS: Record<string, string> = {
  'yay-bulk-order/variant-table-column-quantity': '120px',
  'yay-bulk-order/variant-table-column-subtotal': '110px',
  'yay-bulk-order/variant-table-column-select': '56px',
};

const FLEXIBLE_COLUMN_MIN_WIDTH = '140px';

/** Builds a `grid-template-columns` value for the given (ordered) column block names. */
export function getGridTemplateColumns(columns: string[]): string {
  return columns.map((name) => FIXED_COLUMN_TRACKS[name] ?? `minmax(${FLEXIBLE_COLUMN_MIN_WIDTH}, 1fr)`).join(' ');
}
