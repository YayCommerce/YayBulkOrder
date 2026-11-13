import { Page } from '@playwright/test';

import { expect, step, test } from '../utils/journey';
import { cartQuantities, changeSettings, emptyCart, rest } from '../utils/rest';
import { wpCli } from '../utils/wp-cli';

// Purchase List is a Pro feature. The admin account plays the customer here:
// My Account works the same for any logged-in user.
const PURCHASE_LISTS_URL = '/my-account/yaybulkorder-purchase-list/';
const SAVED_LIST = 'E2E Saved List';
const CART_LIST = 'E2E Cart List';

async function productIdBySku(page: Page, sku: string): Promise<number> {
  const products = await rest<{ id: number }[]>(page, `wc/store/v1/products?sku=${sku}`);
  return products.body[0].id;
}

function deleteE2eLists() {
  for (const title of [SAVED_LIST, CART_LIST]) {
    const ids = wpCli(['post', 'list', '--post_type=yaybulkorder_plist', `--title=${title}`, '--format=ids']);
    if (ids) wpCli(['post', 'delete', ...ids.split(' '), '--force']);
  }
}

test.describe('Purchase List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-account/');
    await emptyCart(page);
  });

  test.afterAll(async ({ browser }) => {
    deleteE2eLists();
    const page = await browser.newPage();
    await page.goto('/my-account/');
    await emptyCart(page);
    await page.close();
  });

  test('opens a list from My Account and adds it to the cart', async ({ page }) => {
    await rest(page, 'yay-bulk-order/v1/purchase-list', 'POST', {
      name: SAVED_LIST,
      products: [
        { productId: await productIdBySku(page, 'YBO-E2E-2'), quantity: 2 },
        { productId: await productIdBySku(page, 'YBO-E2E-3'), quantity: 1 },
      ],
    });

    await step(page, 'My Account: Purchase List', async () => {
      await page.goto('/my-account/');
      await page.getByRole('link', { name: 'Purchase List' }).click();
      await expect(page.getByRole('heading', { name: 'Purchase lists' })).toBeVisible();
    });

    await step(page, `View "${SAVED_LIST}"`, async () => {
      const row = page.locator('tr', { hasText: SAVED_LIST });
      await expect(row).toContainText('2 items');
      await row.getByRole('button', { name: 'View' }).click();
    });

    await step(page, 'Add the whole list to the cart', async () => {
      await page.getByRole('button', { name: 'Add to Cart' }).click();
      await expect.poll(() => cartQuantities(page)).toEqual({ 'YBO-E2E-2': 2, 'YBO-E2E-3': 1 });
    });
  });

  test.describe('"Save as Purchase list" button', () => {
    let restoreSettings: (page: Page) => Promise<void>;

    test.beforeAll(async ({ browser }) => {
      // The mini cart and order details buttons are off by default.
      const page = await browser.newPage();
      await page.goto('/my-account/');
      restoreSettings = await changeSettings(page, (settings) => {
        settings.purchaseList.savePurchaseListButton.isAddToCartPage = true;
        settings.purchaseList.savePurchaseListButton.isAddToCheckoutPage = true;
        settings.purchaseList.savePurchaseListButton.isAddToMiniCart = true;
        settings.purchaseList.savePurchaseListButton.isAddToOrder = true;
      });
      await page.close();
    });

    test.afterAll(async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto('/my-account/');
      await restoreSettings(page);
      await page.close();
    });

    test('shows on the cart, mini cart, checkout and order details', async ({ page }) => {
      const saveButton = page.getByRole('button', { name: 'Save as Purchase list' }).filter({ visible: true });
      await page.goto(`/?add-to-cart=${await productIdBySku(page, 'YBO-E2E-1')}`);

      await step(page, 'Cart page', async () => {
        await page.goto('/cart/');
        await expect(saveButton.first()).toBeVisible();
      });

      await step(page, 'Checkout page', async () => {
        await page.goto('/checkout/');
        await expect(saveButton.first()).toBeVisible();
      });

      await step(page, 'Mini cart (the header cart icon)', async () => {
        await page.goto('/');
        await page.locator('header .brandy-cart-a').first().click();
        await expect(saveButton.first()).toBeVisible();
      });

      await step(page, 'Order details in My Account', async () => {
        const orders = await rest<{ id: number }[]>(page, 'wc/v3/orders?customer=1&status=completed&per_page=1');
        await page.goto(`/my-account/view-order/${orders.body[0].id}/`);
        await expect(saveButton.first()).toBeVisible();
      });
    });

    test('saves the cart as a list from the cart page', async ({ page }) => {
      await page.goto(`/?add-to-cart=${await productIdBySku(page, 'YBO-E2E-1')}`);
      await page.goto('/cart/');

      // The button asks for a name, then confirms with an alert.
      page.on('dialog', (dialog) => (dialog.type() === 'prompt' ? dialog.accept(CART_LIST) : dialog.accept()));
      await step(page, `Cart: "Save as Purchase list", named "${CART_LIST}"`, async () => {
        const saved = page.waitForResponse((response) => response.url().includes('save_purchase_list_from_cart'));
        await page.getByRole('button', { name: 'Save as Purchase list' }).first().click();
        expect((await saved).ok()).toBe(true);
      });

      await step(page, 'The new list is in My Account', async () => {
        await page.goto(PURCHASE_LISTS_URL);
        await expect(page.locator('tr', { hasText: CART_LIST })).toContainText('1 item');
      });
    });
  });
});
