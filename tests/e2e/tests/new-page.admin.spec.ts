import { Page } from '@playwright/test';

import { expect, step, test } from '../utils/journey';
import { rest } from '../utils/rest';
import { column, createTable, deleteTable, TableConfig, tableMenuAction } from '../utils/tables';

// "Create with new page" opens the block editor for a new page with the table
// in it. The page is only checked, never published or saved.
const TITLE = 'E2E New Page Table';

type EditorBlock = { name: string; attributes: Record<string, any> };

/** Every block of the new page's editor, nested ones included. */
async function editorBlocks(editor: Page): Promise<EditorBlock[]> {
  return editor.evaluate(() => {
    const flat = (blocks: any[]): any[] =>
      blocks.flatMap((b) => [{ name: b.name, attributes: b.attributes }, ...flat(b.innerBlocks)]);
    return flat((window as any).wp.data.select('core/block-editor').getBlocks());
  });
}

/** Run "Create with new page" on the table and return the editor tab it opens. */
async function openNewPageEditor(page: Page): Promise<Page> {
  const newTab = page.context().waitForEvent('page');
  await tableMenuAction(page, TITLE, 'Create with new page');
  const editor = await newTab;
  await editor.waitForURL(/post-new\.php\?post_type=page/);
  await editor.waitForFunction(() => (window as any).wp?.data?.select('core/block-editor')?.getBlocks().length > 0);
  return editor;
}

test.describe('Create with new page', () => {
  let tableId: number;
  let config: TableConfig;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    const category = await rest<{ id: number }[]>(page, 'wp/v2/product_cat?slug=e2e-cat-a');
    // Not the default setup, so a match proves the page was built from this table.
    config = {
      title: TITLE,
      query: { queryBy: 'by-category', categories: [category.body[0].id] },
      columns: [
        column('quantity', 'Qty'),
        column('product', 'Item'),
        column('sku', 'SKU', false),
        column('add-to-cart', 'Buy', true, 'hide-on-mobile'),
      ],
      features: { hasFilter: false, hasSearch: true, hasPagination: false },
    };
    tableId = await createTable(page, config);
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    await deleteTable(page, tableId);
    await page.close();
  });

  test('opens the editor with the table set up like the source table', async ({ page }) => {
    let editor!: Page;
    await step(page, 'Product Tables: "Create with new page"', async () => {
      editor = await openNewPageEditor(page);
    });
    await step(editor, 'The new page has the table, set up like the source table', async () => {
      await checkBlocks(editor);
    });
  });

  async function checkBlocks(editor: Page) {
    const blocks = await editorBlocks(editor);
    const block = (name: string) => blocks.find((b) => b.name === `yay-bulk-order/${name}`);

    // Products: the same query.
    expect(block('product-table-root')?.attributes.productQuery).toMatchObject({
      queryType: 'by-category',
      categoryIds: config.query.categories,
      hasPagination: false,
    });

    // Columns: the enabled ones, in the same order, then the select column.
    const header = block('product-table-header')?.attributes.columns as { name: string; className?: string }[];
    expect(header.map((c) => c.name)).toEqual([
      'yay-bulk-order/product-table-column-quantity',
      'yay-bulk-order/product-table-column-product',
      'yay-bulk-order/product-table-column-add-to-cart',
      'yay-bulk-order/product-table-column-select',
    ]);
    expect(header[2].className).toBe('ybod-hide-on-mobile');
    expect(block('product-table-column-sku')).toBeUndefined();

    // Features: search on, filter and pagination off.
    expect(block('product-table-search')).toBeDefined();
    expect(block('product-table-filter')).toBeUndefined();
    expect(block('product-table-pagination')).toBeUndefined();

    // Nothing is saved: the page stays a new, unsaved draft.
    expect(await editor.evaluate(() => (window as any).wp.data.select('core/editor').isEditedPostNew())).toBe(true);
  }

  test('keeps the custom column headings', async ({ page }) => {
    test.fail(
      true,
      'Known bug: the copied header block has no "label", so the server-rendered header shows the default headings.',
    );
    const editor = await openNewPageEditor(page);
    const header = (await editorBlocks(editor)).find((b) => b.name === 'yay-bulk-order/product-table-header');
    expect((header?.attributes.columns as { label?: string }[]).map((c) => c.label)).toEqual([
      'Qty',
      'Item',
      'Buy',
      undefined,
    ]);
  });
});
