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
      await expect(row.locator('.ybod-product-title')).toHaveText(product.name);
    }
  });

  test('adding a row to the cart updates the cart summary', async ({ page }) => {
    await page.goto(`/${PAGE_SLUG}/`);

    const row = page.locator(`tr[data-wp-key="${productIds['YBO-E2E-1']}"]`);
    await row.locator('.ybod-quantity-input').fill('2');
    await row.locator('.ybod-add-to-cart-button').click();

    const cartCount = page.locator('.yay-cart-trigger__count');
    await expect(cartCount).toBeVisible();
    await expect(cartCount).toHaveText('2 items');
  });

  test.describe('Category filter (multi-select)', () => {
    // Seeded by bin/seed.sh: Product One -> e2e-cat-a, Product Two ->
    // e2e-cat-b, Product Three -> no explicit category.
    async function openFilterSidebar(page: import('@playwright/test').Page) {
      await page.getByRole('button', { name: 'Filters' }).click();
    }

    test('selecting one category shows only its products', async ({ page }) => {
      await page.goto(`/${PAGE_SLUG}/`);
      await openFilterSidebar(page);

      await page.getByRole('checkbox', { name: 'E2E Category A' }).check();

      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-1']}"]`)).toBeVisible();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-2']}"]`)).toHaveCount(0);
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-3']}"]`)).toHaveCount(0);
    });

    test('selecting multiple categories shows the union of their products', async ({ page }) => {
      await page.goto(`/${PAGE_SLUG}/`);
      await openFilterSidebar(page);

      await page.getByRole('checkbox', { name: 'E2E Category A' }).check();
      await page.getByRole('checkbox', { name: 'E2E Category B' }).check();

      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-1']}"]`)).toBeVisible();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-2']}"]`)).toBeVisible();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-3']}"]`)).toHaveCount(0);
    });
  });

  test.describe('Tag filter (multi-select)', () => {
    // Seeded by bin/seed.sh: Product One -> e2e-tag-a, Product Two ->
    // e2e-tag-b, Product Three -> no explicit tag.
    async function openFilterSidebar(page: import('@playwright/test').Page) {
      await page.getByRole('button', { name: 'Filters' }).click();
    }

    test('selecting one tag shows only its products', async ({ page }) => {
      await page.goto(`/${PAGE_SLUG}/`);
      await openFilterSidebar(page);

      await page.getByRole('checkbox', { name: 'E2E Tag A' }).check();

      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-1']}"]`)).toBeVisible();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-2']}"]`)).toHaveCount(0);
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-3']}"]`)).toHaveCount(0);
    });

    test('selecting multiple tags shows the union of their products', async ({ page }) => {
      await page.goto(`/${PAGE_SLUG}/`);
      await openFilterSidebar(page);

      await page.getByRole('checkbox', { name: 'E2E Tag A' }).check();
      await page.getByRole('checkbox', { name: 'E2E Tag B' }).check();

      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-1']}"]`)).toBeVisible();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-2']}"]`)).toBeVisible();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-3']}"]`)).toHaveCount(0);
    });
  });

  test.describe('Price range filter', () => {
    // Seeded prices: One = $10, Two = $20, Three = $30.
    async function openFilterSidebar(page: import('@playwright/test').Page) {
      await page.getByRole('button', { name: 'Filters' }).click();
    }

    test('setting only a minimum price excludes cheaper products', async ({ page }) => {
      await page.goto(`/${PAGE_SLUG}/`);
      await openFilterSidebar(page);

      await page.getByRole('spinbutton', { name: 'Minimum price' }).fill('15');
      await page.getByRole('spinbutton', { name: 'Minimum price' }).blur();

      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-1']}"]`)).toHaveCount(0);
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-2']}"]`)).toBeVisible();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-3']}"]`)).toBeVisible();
    });

    test('setting min and max narrows to the range between them', async ({ page }) => {
      await page.goto(`/${PAGE_SLUG}/`);
      await openFilterSidebar(page);

      // Each input navigates on its own change event, carrying the *other*
      // field's already-set value along — sequential, not parallel, so the
      // 2nd navigation's URL has both bounds.
      await page.getByRole('spinbutton', { name: 'Minimum price' }).fill('15');
      await page.getByRole('spinbutton', { name: 'Minimum price' }).blur();
      await page.getByRole('spinbutton', { name: 'Maximum price' }).fill('25');
      await page.getByRole('spinbutton', { name: 'Maximum price' }).blur();

      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-1']}"]`)).toHaveCount(0);
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-2']}"]`)).toBeVisible();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-3']}"]`)).toHaveCount(0);
    });
  });

  test.describe('Rating filter', () => {
    // Seeded ratings: One = 5, Two = 3, Three = unrated (0).
    async function openFilterSidebar(page: import('@playwright/test').Page) {
      await page.getByRole('button', { name: 'Filters' }).click();
    }

    test('selecting a rating shows only products at or above it', async ({ page }) => {
      await page.goto(`/${PAGE_SLUG}/`);
      await openFilterSidebar(page);

      await page.getByRole('checkbox', { name: '4 stars & up' }).check();

      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-1']}"]`)).toBeVisible();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-2']}"]`)).toHaveCount(0);
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-3']}"]`)).toHaveCount(0);
    });

    test('unchecking the selected rating clears the filter', async ({ page }) => {
      await page.goto(`/${PAGE_SLUG}/`);
      await openFilterSidebar(page);

      const fourStarsAndUp = page.getByRole('checkbox', { name: '4 stars & up' });
      await fourStarsAndUp.check();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-2']}"]`)).toHaveCount(0);

      await fourStarsAndUp.uncheck();
      await expect(page.locator(`tr[data-wp-key="${productIds['YBO-E2E-2']}"]`)).toBeVisible();
    });
  });
});

test.describe('Two Product Table instances on one page (queryId collision fix)', () => {
  // bin/seed.sh inserts the same "simple-product-table" pattern twice on
  // /e2e-product-table-duplicate/ — both instances are born with the same
  // baked queryId. Engines/Blocks/RegisterBlocks::disambiguate_query_id()
  // must rewrite the 2nd one's queryId so their filter state (and the
  // Interactivity API router region each one owns) never cross-contaminate.
  const DUPLICATE_PAGE_SLUG = 'e2e-product-table-duplicate';

  test('filtering the first table does not affect the second', async ({ page, request, baseURL }) => {
    const productOneId = await getProductIdBySku(request, baseURL!, 'YBO-E2E-1');
    const productTwoId = await getProductIdBySku(request, baseURL!, 'YBO-E2E-2');

    await page.goto(`/${DUPLICATE_PAGE_SLUG}/`);

    const tables = page.locator('.wp-block-yay-bulk-order-product-table-root');
    await expect(tables).toHaveCount(2);
    const [firstTable, secondTable] = [tables.nth(0), tables.nth(1)];

    // Both start unfiltered.
    await expect(firstTable.locator(`tr[data-wp-key="${productOneId}"]`)).toBeVisible();
    await expect(firstTable.locator(`tr[data-wp-key="${productTwoId}"]`)).toBeVisible();
    await expect(secondTable.locator(`tr[data-wp-key="${productOneId}"]`)).toBeVisible();
    await expect(secondTable.locator(`tr[data-wp-key="${productTwoId}"]`)).toBeVisible();

    await firstTable.getByRole('button', { name: 'Filters' }).click();
    await firstTable.getByRole('checkbox', { name: 'E2E Category A' }).check();

    // First table: filtered down to just Product One.
    await expect(firstTable.locator(`tr[data-wp-key="${productOneId}"]`)).toBeVisible();
    await expect(firstTable.locator(`tr[data-wp-key="${productTwoId}"]`)).toHaveCount(0);

    // Second table: completely untouched by the first table's filter.
    await expect(secondTable.locator(`tr[data-wp-key="${productOneId}"]`)).toBeVisible();
    await expect(secondTable.locator(`tr[data-wp-key="${productTwoId}"]`)).toBeVisible();
  });
});
