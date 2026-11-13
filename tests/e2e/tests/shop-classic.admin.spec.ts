import { expect, step, test } from '../utils/journey';
import { rest } from '../utils/rest';
import { createTable, defaultTable, deleteTable, tableMenuAction } from '../utils/tables';
import { activateTheme, BLOCK_THEME, CLASSIC_THEME } from '../utils/wp-cli';

// The only test on a classic theme: there the plugin replaces the shop loop
// itself, instead of the user editing the Catalog template.
const TITLE = 'E2E Classic Shop Table';

test.describe('Catalog page on a classic theme', () => {
  let tableId: number;

  test.beforeAll(async ({ browser }) => {
    activateTheme(CLASSIC_THEME);
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    tableId = await createTable(page, defaultTable(TITLE));
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    await rest(page, 'yay-bulk-order/v1/product-tables/apply_to_shop', 'POST', { tableId: 0 });
    await deleteTable(page, tableId);
    await page.close();
    activateTheme(BLOCK_THEME);
  });

  test('"Use in Shop / Category" shows the table on the shop page', async ({ page, context }) => {
    // The action opens the shop page in a new tab.
    const shopTab = context.waitForEvent('page');

    await step(page, 'Product Tables: "Use in Shop / Category", then confirm', async () => {
      await tableMenuAction(page, TITLE, 'Use in Shop / Category');
      const confirm = page.getByRole('alertdialog').or(page.getByRole('dialog')).filter({
        hasText: 'Use this table in Shop / Category?',
      });
      await confirm.getByRole('button', { name: 'Use in Shop / Category' }).click();
      await expect(page.getByText('Applied to Shop/Category page.')).toBeVisible();
    });

    const shop = await shopTab;
    await step(shop, 'The shop page shows the table instead of the product grid', async () => {
      await shop.waitForLoadState();
      await expect(shop.locator('table.wp-block-yay-bulk-order-product-table')).toBeVisible();
      await expect(shop.locator('tr.yay-bulk-order-table-template-row').first()).toBeVisible();
      await expect(shop.locator('ul.products')).toHaveCount(0);
    });
  });
});
