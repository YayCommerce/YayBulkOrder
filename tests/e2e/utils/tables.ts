import { Page } from '@playwright/test';

import { rest } from './rest';

export const TABLES_URL = '/wp-admin/admin.php?page=yay_bulk_order#/product-tables';

export type TableColumn = { slug: string; heading: string; enabled: boolean; responsive: string };

export type TableConfig = {
  title: string;
  query: { queryBy: string; categories?: number[]; products?: number[] };
  columns: TableColumn[];
  features: { hasFilter: boolean; hasSearch: boolean; hasPagination: boolean; pageSize?: number };
};

export const column = (slug: string, heading: string, enabled = true, responsive = 'always-show'): TableColumn => ({
  slug,
  heading,
  enabled,
  responsive,
});

/** A table with every default column and feature, showing all products. */
export function defaultTable(title: string): TableConfig {
  return {
    title,
    query: { queryBy: 'all-products' },
    columns: [
      column('product', 'Product'),
      column('sku', 'SKU'),
      column('description', 'Description', false),
      column('quantity', 'Quantity'),
      column('subtotal', 'Subtotal'),
      column('add-to-cart', 'Add to Cart'),
    ],
    features: { hasFilter: true, hasSearch: true, hasPagination: true, pageSize: 10 },
  };
}

/** Create a saved product table through the plugin's REST API. Returns its id. */
export async function createTable(page: Page, config: TableConfig): Promise<number> {
  const response = await rest<{ id: number }>(page, 'yay-bulk-order/v1/product-tables', 'POST', config);
  if (response.status !== 200 || !response.body?.id) {
    throw new Error(`Could not create table "${config.title}": ${response.status} ${JSON.stringify(response.body)}`);
  }
  return response.body.id;
}

export async function deleteTable(page: Page, id: number): Promise<void> {
  await rest(page, `yay-bulk-order/v1/product-tables/${id}`, 'DELETE');
}

/** Delete every saved table with this title (cleanup for tables made through the UI). */
export async function deleteTablesByTitle(page: Page, title: string): Promise<void> {
  const list = await rest<{ data: { id: number; title: string }[] }>(
    page,
    `yay-bulk-order/v1/product-tables?perPage=50&page=1&search=${encodeURIComponent(title)}`,
  );
  for (const table of list.body?.data ?? []) {
    if (table.title === title) await deleteTable(page, table.id);
  }
}

/** Open a table's row menu in the Product Tables list and pick an action. */
export async function tableMenuAction(page: Page, title: string, action: string): Promise<void> {
  await page.goto(TABLES_URL);
  const row = page.locator('tr', { hasText: title }).first();
  await row.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', { name: action }).click();
}

export async function clipboardText(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText());
}
