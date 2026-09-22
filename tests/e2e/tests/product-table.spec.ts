import { APIRequestContext, expect, test } from '@playwright/test';

// Fixed by tests/e2e/bin/seed.sh — kept in sync manually since this is the
// only spec today (see .claude/skills/we2e/SKILL.md for the plan to grow
// this suite past a single hand-maintained fixture list).
const PAGE_SLUG = 'e2e-product-table';
const PRODUCTS = [
  { sku: 'YBO-E2E-1', name: 'E2E Product One' },
  { sku: 'YBO-E2E-2', name: 'E2E Product Two' },
  { sku: 'YBO-E2E-3', name: 'E2E Product Three' },
] as const;

// WooCommerce's public Store API — no auth needed for published products —
// so the spec never has to guess IDs or touch wp-cli at test time.
async function getProductIdBySku(request: APIRequestContext, baseURL: string, sku: string): Promise<number> {
  const response = await request.get(`${baseURL}/wp-json/wc/store/v1/products`, { params: { sku } });
  const products = await response.json();
  if (!products.length) {
    throw new Error(`No product found for SKU "${sku}" — did the e2e seed script run? (pnpm test:e2e:env:start)`);
  }
  return products[0].id;
}

test.describe('Product Table block', () => {
  let productIds: Record<string, number>;

  test.beforeAll(async ({ request, baseURL }) => {
    productIds = {};
    for (const product of PRODUCTS) {
      productIds[product.sku] = await getProductIdBySku(request, baseURL!, product.sku);
    }
  });

  test('renders every seeded product as a row', async ({ page }) => {
    await page.goto(`/${PAGE_SLUG}/`);

    await expect(page.locator('table.wp-block-yay-bulk-order-product-table')).toBeVisible();
    await expect(page.locator('.wp-block-yay-bulk-order-product-table-header th').first()).toHaveText('Product');

    for (const product of PRODUCTS) {
      const row = page.locator(`tr[data-wp-key="${productIds[product.sku]}"]`);
      await expect(row).toBeVisible();
      await expect(row.locator('.ybo-product-title')).toHaveText(product.name);
    }
  });

  test('adding a row to the cart updates the cart summary', async ({ page }) => {
    await page.goto(`/${PAGE_SLUG}/`);

    const row = page.locator(`tr[data-wp-key="${productIds['YBO-E2E-1']}"]`);
    await row.locator('.ybo-quantity-input').fill('2');
    await row.locator('.ybo-add-to-cart-button').click();

    const cartCount = page.locator('.yay-cart-trigger__count');
    await expect(cartCount).toBeVisible();
    await expect(cartCount).toHaveText('2 items');
  });
});
