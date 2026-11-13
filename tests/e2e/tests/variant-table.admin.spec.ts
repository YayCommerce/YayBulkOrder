import { expect, step, test } from '../utils/journey';
import { cartQuantities, emptyCart, rest } from '../utils/rest';
import { editorCanvas } from '../utils/site-editor';

// Variant Table (Pro): one row per variation of a product, picked in the editor.
const PRODUCT = 'E2E Variable Hoodie';

test.describe('Variant Table', () => {
  let pageId: number;
  let pageUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    const created = await rest<{ id: number; link: string }>(page, 'wp/v2/pages', 'POST', {
      title: 'E2E Variant Table',
      status: 'publish',
      content: '',
    });
    pageId = created.body.id;
    pageUrl = created.body.link;
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    await rest(page, `wp/v2/pages/${pageId}?force=true`, 'DELETE');
    await emptyCart(page);
    await page.close();
  });

  test('adds the table in the editor, then orders variations from it', async ({ page }) => {
    await step(page, 'Editor: insert the Variant Table block', async () => {
      await page.goto(`/wp-admin/post.php?post=${pageId}&action=edit`);
      await page.getByRole('button', { name: 'Block Inserter' }).click();
      await page.getByRole('searchbox', { name: 'Search' }).fill('Variant Table');
      // The block comes first; the pattern of the same name is listed after it.
      await page.getByRole('option', { name: 'Variant Table', exact: true }).first().click();
    });

    await step(page, `Pick the product: ${PRODUCT}`, async () => {
      const canvas = editorCanvas(page);
      await canvas.locator('input[type="text"]').first().fill('Hoodie');
      await canvas.getByRole('option', { name: PRODUCT }).click();
      await expect(canvas.locator('.wp-block-yay-bulk-order-variant-table-header')).toBeVisible();
    });

    await step(page, 'Save the page', async () => {
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.waitForFunction(() => {
        const editor = (window as any).wp.data.select('core/editor');
        return !editor.isSavingPost() && !editor.isEditedPostDirty();
      });
    });

    await emptyCart(page);
    const product = (
      await rest<{ variations: { id: number; attributes: { value: string }[] }[] }[]>(
        page,
        'wc/store/v1/products?sku=YBO-E2E-VAR',
      )
    ).body[0];
    const variationId = (size: string) =>
      product.variations.find((v) => v.attributes[0].value.toLowerCase() === size)!.id;

    await step(page, 'Front end: one row per variation', async () => {
      await page.goto(pageUrl);
      await expect(page.locator('tr.yay-bulk-order-variant-table-row')).toHaveCount(3);
    });

    await step(page, 'Pick M x2 and L x1, then add them to the cart', async () => {
      for (const [size, quantity] of [
        ['m', 2],
        ['l', 1],
      ] as const) {
        const row = page.locator(`tr.yay-bulk-order-variant-table-row[data-wp-key="${variationId(size)}"]`);
        await row.locator('.ybod-quantity-input').fill(String(quantity));
        await row.getByRole('checkbox').check();
      }
      await page.locator('.ybod-variant-table-add-to-cart').click();
      await expect.poll(() => cartQuantities(page)).toEqual({ 'YBO-E2E-VAR-M': 2, 'YBO-E2E-VAR-L': 1 });
    });
  });
});
