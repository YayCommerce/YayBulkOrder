import path from 'path';
import { Page } from '@playwright/test';

import { expect, step, test } from '../utils/journey';
import { cartQuantities, changeSettings, emptyCart } from '../utils/rest';

// Quick Order (Pro): add many products at once from a CSV file of SKUs and
// quantities. Its My Account page is off by default.
const CSV_FILE = path.join(__dirname, '../data/quick-order.csv');

test.describe('Quick Order', () => {
  let restoreSettings: (page: Page) => Promise<void>;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/my-account/');
    restoreSettings = await changeSettings(page, (settings) => {
      settings.csvOrder.isAddToAccountPage = true;
    });
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/my-account/');
    await restoreSettings(page);
    await emptyCart(page);
    await page.close();
  });

  test('uploads a CSV in My Account and adds its products to the cart', async ({ page }) => {
    await page.goto('/my-account/');
    await emptyCart(page);

    await step(page, 'My Account: Quick Order', async () => {
      await page.getByRole('link', { name: 'Quick Order' }).click();
    });

    await step(page, 'Upload a CSV of SKUs and quantities', async () => {
      await page.locator('input[type="file"][name="ybod_csv_order"]').setInputFiles(CSV_FILE);
      await expect(page.getByText('quick-order.csv')).toBeVisible();
    });

    await step(page, 'Add to Cart: the CSV products are in the cart', async () => {
      await page.getByRole('button', { name: 'Add to Cart' }).click();
      await expect.poll(() => cartQuantities(page)).toEqual({ 'YBO-E2E-1': 3, 'YBO-E2E-2': 1 });
    });
  });
});
