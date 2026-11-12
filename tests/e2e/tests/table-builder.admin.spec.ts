import { expect, step, test } from '../utils/journey';
import { deleteTablesByTitle, TABLES_URL } from '../utils/tables';

const TITLE = 'E2E Builder Table';

test.describe('Table Builder', () => {
  test.afterEach(async ({ page }) => {
    await deleteTablesByTitle(page, TITLE);
  });

  test('builds a table through the four steps and lists it', async ({ page }) => {
    const builder = page.getByRole('dialog');

    await step(page, 'Open the Table Builder and pick a template', async () => {
      await page.goto(`${TABLES_URL}/new`);
      await builder.getByRole('button', { name: 'Build from this template' }).first().click();
    });

    await step(page, '1. Products: show all products', async () => {
      await expect(builder.getByText('Select products to display')).toBeVisible();
      await builder.getByText('All products', { exact: true }).click();
      await builder.getByRole('button', { name: 'Next' }).click();
    });

    await step(page, "2. Columns: the template's columns", async () => {
      await expect(builder.locator('input[name="columns.0.heading"]')).toHaveValue('Product');
      await builder.getByRole('button', { name: 'Next' }).click();
    });

    await step(page, '3. Features: filter, search and pagination', async () => {
      await expect(builder.getByText('Pagination')).toBeVisible();
      await builder.getByRole('button', { name: 'Next' }).click();
    });

    await step(page, '4. Publish: name the table and save it', async () => {
      await builder.locator('input[name="title"]').fill(TITLE);
      await builder.getByRole('button', { name: 'Save for later' }).click();
      await expect(builder.getByRole('button', { name: 'Saved' })).toBeVisible();
      await builder.getByRole('button', { name: 'Close' }).click();
    });

    await step(page, 'The new table is in the list', async () => {
      const row = page.locator('tr', { hasText: TITLE });
      await expect(row).toBeVisible();
      await expect(row.getByText('All products')).toBeVisible();
      await expect(row.getByText('Add to Cart')).toBeVisible();
    });
  });
});
