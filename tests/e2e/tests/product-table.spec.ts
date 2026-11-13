import { APIRequestContext, Locator, Page } from '@playwright/test';

import { expect, step, test } from '../utils/journey';

// Fixed by tests/e2e/bin/seed.sh — keep in sync with it.
const PAGE_SLUG = 'e2e-product-table';
const PRODUCTS = [
  { sku: 'YBO-E2E-1', name: 'E2E Product One' },
  { sku: 'YBO-E2E-2', name: 'E2E Product Two' },
  { sku: 'YBO-E2E-3', name: 'E2E Product Three' },
] as const;
type Sku = (typeof PRODUCTS)[number]['sku'];

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

  function row(scope: Page | Locator, sku: Sku): Locator {
    return scope.locator(`tr[data-wp-key="${productIds[sku]}"]`);
  }

  /** The rows the table shows now: the SKUs given, and none of the others. */
  async function expectRows(page: Page, shown: Sku[]) {
    for (const { sku } of PRODUCTS) {
      if (shown.includes(sku)) await expect(row(page, sku)).toBeVisible();
      else await expect(row(page, sku)).toHaveCount(0);
    }
  }

  async function openFilters(page: Page) {
    await page.goto(`/${PAGE_SLUG}/`);
    await page.getByRole('button', { name: 'Filters' }).click();
  }

  test('renders every seeded product, then adds a row to the cart', async ({ page }) => {
    await step(page, 'The table lists every product', async () => {
      await page.goto(`/${PAGE_SLUG}/`);
      await expect(page.locator('table.wp-block-yay-bulk-order-product-table')).toBeVisible();
      await expect(page.locator('.wp-block-yay-bulk-order-product-table-header th').first()).toHaveText('Product');
      for (const product of PRODUCTS) {
        await expect(row(page, product.sku).locator('.ybod-product-title')).toHaveText(product.name);
      }
    });

    await step(page, 'Add 2 of Product One: the cart summary shows 2 items', async () => {
      const first = row(page, 'YBO-E2E-1');
      await first.locator('.ybod-quantity-input').fill('2');
      await first.locator('.ybod-add-to-cart-button').click();
      await expect(page.locator('.yay-cart-trigger__count')).toHaveText('2 items');
    });
  });

  // Seeded by bin/seed.sh: One -> e2e-cat-a, Two -> e2e-cat-b, Three -> no category.
  test('category filter: one category, then the union of two', async ({ page }) => {
    await openFilters(page);

    await step(page, 'Category A: only its product', async () => {
      await page.getByRole('checkbox', { name: 'E2E Category A' }).check();
      await expectRows(page, ['YBO-E2E-1']);
    });
    await step(page, 'Category A + B: the products of both', async () => {
      await page.getByRole('checkbox', { name: 'E2E Category B' }).check();
      await expectRows(page, ['YBO-E2E-1', 'YBO-E2E-2']);
    });
  });

  // Seeded by bin/seed.sh: One -> e2e-tag-a, Two -> e2e-tag-b, Three -> no tag.
  test('tag filter: one tag, then the union of two', async ({ page }) => {
    await openFilters(page);

    await step(page, 'Tag A: only its product', async () => {
      await page.getByRole('checkbox', { name: 'E2E Tag A' }).check();
      await expectRows(page, ['YBO-E2E-1']);
    });
    await step(page, 'Tag A + B: the products of both', async () => {
      await page.getByRole('checkbox', { name: 'E2E Tag B' }).check();
      await expectRows(page, ['YBO-E2E-1', 'YBO-E2E-2']);
    });
  });

  // Seeded prices: One = $10, Two = $20, Three = $30.
  test('price filter: a minimum, then a maximum too', async ({ page }) => {
    await openFilters(page);

    // Each input navigates on its own change event and carries the other
    // field's value along, so set them one after the other.
    await step(page, 'Minimum $15: the $10 product is gone', async () => {
      const min = page.getByRole('spinbutton', { name: 'Minimum price' });
      await min.fill('15');
      await min.blur();
      await expectRows(page, ['YBO-E2E-2', 'YBO-E2E-3']);
    });
    await step(page, 'Maximum $25 too: only the $20 product', async () => {
      const max = page.getByRole('spinbutton', { name: 'Maximum price' });
      await max.fill('25');
      await max.blur();
      await expectRows(page, ['YBO-E2E-2']);
    });
  });

  // Seeded ratings: One = 5, Two = 3, Three = unrated (0).
  test('rating filter: 4 stars & up, then cleared', async ({ page }) => {
    await openFilters(page);

    const fourStarsAndUp = page.getByRole('checkbox', { name: '4 stars & up' });
    await step(page, '4 stars & up: only the 5-star product', async () => {
      await fourStarsAndUp.check();
      await expectRows(page, ['YBO-E2E-1']);
    });
    await step(page, 'Clear the rating: every product again', async () => {
      await fourStarsAndUp.uncheck();
      await expectRows(page, ['YBO-E2E-1', 'YBO-E2E-2', 'YBO-E2E-3']);
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
