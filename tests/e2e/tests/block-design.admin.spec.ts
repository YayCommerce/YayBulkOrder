import { expect, step, test } from '../utils/journey';
import { rest } from '../utils/rest';
import { editorCanvas } from '../utils/site-editor';

// A table's own design: colors set on the Table block override the plugin's
// Design settings for that table only.
const HEADER_COLOR = '#123456';
const HEADER_RGB = 'rgb(18, 52, 86)';

test.describe('Table block design', () => {
  let pageId: number;
  let pageUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    const pattern = await page.evaluate(async () => {
      const nonce = await fetch('/wp-admin/admin-ajax.php?action=rest-nonce').then((r) => r.text());
      const patterns = await fetch('/wp-json/wp/v2/block-patterns/patterns', { headers: { 'X-WP-Nonce': nonce } }).then(
        (r) => r.json(),
      );
      return patterns.find((p: { name: string }) => p.name === 'yay-bulk-order/simple-product-table').content as string;
    });
    const created = await rest<{ id: number; link: string }>(page, 'wp/v2/pages', 'POST', {
      title: 'E2E Block Design',
      status: 'publish',
      content: pattern,
    });
    pageId = created.body.id;
    pageUrl = created.body.link;
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/wp-admin/');
    await rest(page, `wp/v2/pages/${pageId}?force=true`, 'DELETE');
    await page.close();
  });

  test('a header color set on the Table block shows on the front end', async ({ page }) => {
    await step(page, 'Open the page and select the Table block', async () => {
      await page.goto(`/wp-admin/post.php?post=${pageId}&action=edit`);
      // Click a header cell, then its "Table" breadcrumb.
      await editorCanvas(page).locator('.wp-block-yay-bulk-order-product-table-header').first().click();
      await page.getByRole('button', { name: 'Table', exact: true }).last().click();
    });

    await step(page, `Block settings: Header Background Color ${HEADER_COLOR}`, async () => {
      await page
        .getByRole('tab', { name: 'Settings' })
        .click()
        .catch(() => {});
      await page.getByRole('button', { name: 'Header Background Color' }).click();
      await page.getByRole('button', { name: 'Custom color picker' }).click();
      const hex = page.getByRole('textbox', { name: 'Hex color' });
      await hex.fill(HEADER_COLOR.slice(1));
      await hex.press('Enter');
      await page.keyboard.press('Escape');
    });

    await step(page, 'Save the page', async () => {
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.waitForFunction(() => {
        const editor = (window as any).wp.data.select('core/editor');
        return !editor.isSavingPost() && !editor.isEditedPostDirty();
      });
    });

    await step(page, 'The front end shows the header color', async () => {
      await page.goto(pageUrl);
      const headerCell = page.locator('.wp-block-yay-bulk-order-product-table-header th').first();
      await expect(headerCell).toHaveCSS('background-color', HEADER_RGB);
    });
  });
});
