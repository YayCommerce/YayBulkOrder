import { Page } from '@playwright/test';

import { expect, step, test } from '../utils/journey';
import { rest } from '../utils/rest';
import {
  editorBlockNames,
  editorCanvas,
  focusNewParagraphInMain,
  openCatalogTemplate,
  resetCatalogTemplate,
  saveSiteEditor,
} from '../utils/site-editor';
import { clipboardText, createTable, defaultTable, deleteTable, tableMenuAction } from '../utils/tables';
import { BLOCK_THEME } from '../utils/wp-cli';

// The block theme way to put a table on the shop page: the user copies the
// table (or makes a pattern of it) and puts it in the Catalog template.
const TITLE = 'E2E Catalog Table';

async function openTemplateAtNewParagraph(page: Page) {
  await step(page, 'Open the Catalog template in the Site Editor', async () => {
    await openCatalogTemplate(page, BLOCK_THEME);
    await focusNewParagraphInMain(page);
  });
}

async function saveAndCheckShop(page: Page) {
  await step(page, 'Save the template', async () => {
    await saveSiteEditor(page);
  });
  await step(page, 'The shop page shows the table', async () => {
    await page.goto('/shop/');
    await expect(page.locator('table.wp-block-yay-bulk-order-product-table')).toBeVisible();
    await expect(page.locator('tr.yay-bulk-order-table-template-row').first()).toBeVisible();
  });
}

test.describe('Catalog template on a block theme', () => {
  test.describe.configure({ mode: 'serial' });
  let tableId: number;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    tableId = await createTable(page, defaultTable(TITLE));
    await page.close();
  });

  test.afterEach(async ({ page }) => {
    await resetCatalogTemplate(page, BLOCK_THEME);
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    await deleteTable(page, tableId);
    // Patterns made by "Create Pattern" carry the table's title.
    const patterns = await rest<{ id: number; title: { raw: string } }[]>(
      page,
      'wp/v2/blocks?per_page=50&context=edit',
    );
    for (const pattern of patterns.body ?? []) {
      if (pattern.title.raw === TITLE) await rest(page, `wp/v2/blocks/${pattern.id}?force=true`, 'DELETE');
    }
    await page.close();
  });

  test('Copy as Blocks, then paste into the Catalog template', async ({ page }) => {
    await step(page, 'Product Tables: "Copy as Blocks"', async () => {
      await tableMenuAction(page, TITLE, 'Copy as Blocks');
      expect(await clipboardText(page)).toContain('<!-- wp:yay-bulk-order/product-table-root');
    });
    await openTemplateAtNewParagraph(page);
    await step(page, 'Paste the table blocks', async () => {
      await page.keyboard.press('ControlOrMeta+V');
      await expect(editorCanvas(page).locator('.wp-block-yay-bulk-order-product-table-root')).toBeVisible();
    });
    await saveAndCheckShop(page);
  });

  test('Copy as Shortcode, then paste into the Catalog template', async ({ page }) => {
    await step(page, 'Product Tables: "Copy as Shortcode"', async () => {
      await tableMenuAction(page, TITLE, 'Copy as Shortcode');
      expect(await clipboardText(page)).toBe(`[yaybulkorder-product-table id=${tableId}]`);
    });
    await openTemplateAtNewParagraph(page);
    await step(page, 'Paste the shortcode: it becomes a Shortcode block', async () => {
      await page.keyboard.press('ControlOrMeta+V');
      await expect.poll(() => editorBlockNames(page)).toContain('core/shortcode');
    });
    await saveAndCheckShop(page);
  });

  test('Create Pattern, then insert it into the Catalog template', async ({ page }) => {
    await step(page, 'Product Tables: "Create Pattern"', async () => {
      await tableMenuAction(page, TITLE, 'Create Pattern');
      await expect(page.getByText('Pattern created successfully.')).toBeVisible();
    });
    await openTemplateAtNewParagraph(page);
    await step(page, 'Insert the pattern from the Block Inserter', async () => {
      await page.getByRole('button', { name: 'Block Inserter' }).click();
      await page.getByRole('tab', { name: 'Patterns' }).click();
      await page.getByRole('searchbox', { name: 'Search' }).fill(TITLE);
      await page.getByRole('option', { name: TITLE }).first().click();
      await expect(editorCanvas(page).locator('.wp-block-yay-bulk-order-product-table-root')).toBeVisible();
    });
    await saveAndCheckShop(page);
  });
});
