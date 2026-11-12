import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { expect, Locator, Page, test } from '@playwright/test';

import { cartQuantities, emptyCart, rest } from '../utils/rest';
import {
  editorCanvas,
  focusNewParagraphInMain,
  openCatalogTemplate,
  resetCatalogTemplate,
  saveSiteEditor,
} from '../utils/site-editor';
import { TABLES_URL, tableMenuAction } from '../utils/tables';
import { activateTheme, BLOCK_THEME, CLASSIC_THEME } from '../utils/wp-cli';

/**
 * Every file this script writes to the docs assets folder, in the order of the
 * docs. It writes no other name there, so a rerun only replaces its own shots.
 */
const MANIFEST = [
  'table-builder-templates',
  'table-builder-products',
  'table-builder-columns',
  'table-builder-features',
  'table-builder-publish',
  'product-tables-list',
  'publish-use-in-shop',
  'shop-page-classic-table',
  'table-actions-copy-blocks',
  'catalog-template-paste-blocks',
  'shop-page-block-table',
  'table-actions-copy-shortcode',
  'catalog-template-shortcode-block',
  'publish-create-pattern',
  'catalog-template-insert-pattern',
  'publish-create-new-page',
  'new-page-editor-table',
  'my-account-purchase-lists',
  'purchase-list-detail',
  'purchase-list-added-to-cart',
  'save-purchase-list-cart',
  'save-purchase-list-mini-cart',
  'save-purchase-list-checkout',
  'save-purchase-list-order-details',
  'my-account-quick-order',
  'quick-order-upload',
  'quick-order-added-to-cart',
  'table-block-color-settings',
  'table-custom-design-front',
  'variant-table-front',
  'variant-table-selected',
] as const;
type Shot = (typeof MANIFEST)[number];

const ASSETS_DIR = process.env.DOCS_SHOTS_OUT ?? '';
const PNG_DIR = path.join(__dirname, 'png');
/** The docs' widest image (README.md › Images). A crop up to 800 CSS px fits at deviceScaleFactor 2. */
const MAX_PX = 1600;
/** A wide part (a list, a table) up to this many CSS px, scaled down to MAX_PX. */
const WIDE_CSS = 1100;
const MAX_BYTES = 1024 * 1024;
const TABLE = 'Clothing Order Form';
const CSV_FILE = path.join(__dirname, 'quick-order.csv');

if (!ASSETS_DIR) throw new Error('DOCS_SHOTS_OUT must name the docs assets folder (run.sh sets it).');

// Other plugins' and WordPress's notices, the front-end admin bar and the text caret are not what the docs show.
const QUIET_CSS = `
  .notice, .update-nag, div.updated, div.error { display: none !important; }
  body:not(.wp-admin) #wpadminbar { display: none !important; }
  html:not(.wp-toolbar) { margin-top: 0 !important; }
  * { caret-color: transparent !important; }
`;

test.beforeEach(async ({ page }) => {
  await page.addInitScript((css) => {
    if (window.top !== window) return;
    const add = () => {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    };
    if (document.head) add();
    else document.addEventListener('DOMContentLoaded', add);
  }, QUIET_CSS);

  await page.goto('/wp-login.php');
  await page.fill('#user_login', 'admin');
  await page.fill('#user_pass', 'password');
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');
});

type Box = { x: number; y: number; width: number; height: number };

/** PNG of the target, then a WebP in the docs assets folder, well under the docs' 1 MB. */
async function shoot(page: Page, name: Shot, target: Locator | Box, { wide = false, hover }: { wide?: boolean; hover?: Locator } = {}) {
  if (!MANIFEST.includes(name)) throw new Error(`${name} is not in the manifest`);
  // No focus ring or hover left by the last click, then the hover the shot is about.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  // The bottom-right corner: (0,0) is the admin bar's WordPress menu, which opens on hover.
  const viewport = page.viewportSize()!;
  await page.mouse.move(viewport.width - 1, viewport.height - 1);
  if (hover) await hover.hover();
  // The editors keep polling, so the network may never go quiet for long.
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);

  // A padded crop stops at the window's edges.
  if ('x' in target) target = { ...target, width: Math.min(target.width, viewport.width - target.x), height: Math.min(target.height, viewport.height - target.y) };
  const box = 'x' in target ? target : await target.boundingBox();
  if (!box) throw new Error(`${name}: nothing to capture`);
  const maxCss = wide ? WIDE_CSS : MAX_PX / 2;
  expect(box.width, `${name} is wider than ${maxCss} CSS px`).toBeLessThanOrEqual(maxCss);

  fs.mkdirSync(PNG_DIR, { recursive: true });
  const png = path.join(PNG_DIR, `${name}.png`);
  if ('x' in target) await page.screenshot({ path: png, clip: target, animations: 'disabled' });
  else await target.screenshot({ path: png, animations: 'disabled' });

  const webp = path.join(ASSETS_DIR, `${name}.webp`);
  for (const quality of [82, 70, 55]) {
    const resize = box.width * 2 > MAX_PX ? ['-resize', String(MAX_PX), '0'] : [];
    execFileSync('cwebp', ['-quiet', '-q', String(quality), '-m', '6', ...resize, png, '-o', webp]);
    if (fs.statSync(webp).size < MAX_BYTES / 2) break;
  }
  expect(fs.statSync(webp).size, `${name}.webp size`).toBeLessThan(MAX_BYTES);
}

/** The union of the boxes, padded, for a crop that spans sibling elements. */
async function around(locators: Locator[], pad = 16): Promise<Box> {
  const boxes = await Promise.all(locators.map((l) => l.boundingBox()));
  if (boxes.some((b) => !b)) throw new Error('around: a part is not on screen');
  const valid = boxes as Box[];
  const x = Math.min(...valid.map((b) => b.x)) - pad;
  const y = Math.min(...valid.map((b) => b.y)) - pad;
  const right = Math.max(...valid.map((b) => b.x + b.width)) + pad;
  const bottom = Math.max(...valid.map((b) => b.y + b.height)) + pad;
  return { x: Math.max(0, x), y: Math.max(0, y), width: right - Math.max(0, x), height: bottom - Math.max(0, y) };
}

/** The admin app's card that holds this text. */
function card(page: Page, text: string): Locator {
  return page.locator('[data-slot="card"]').filter({ hasText: text }).last();
}

/** Open the table builder on an existing table and go to one of its steps. */
async function openBuilderStep(page: Page, title: string, step: 'Products' | 'Columns' | 'Features' | 'Publish') {
  await tableMenuAction(page, title, 'Edit');
  await page.getByRole('dialog').getByRole('button', { name: new RegExp(`${step}$`) }).click();
}

async function productIdBySku(page: Page, sku: string): Promise<number> {
  return (await rest<{ id: number }[]>(page, `wc/store/v1/products?sku=${sku}`)).body[0].id;
}

/** The Cart or Checkout block once its items show: they load after the page. */
async function waitForCartBlock(page: Page): Promise<void> {
  await page.locator('.wc-block-components-product-name').first().waitFor();
  await page.waitForFunction(() => !document.querySelector('.wc-block-components-skeleton, .wc-block-components-loading-mask, .is-loading'));
}

/** The main content of a front-end page: the block, without the theme's header and footer. */
function frontBlock(page: Page, selector: string): Locator {
  return page.locator(selector).first();
}

test('1. Table Builder: table-builder-templates table-builder-products table-builder-columns table-builder-features table-builder-publish product-tables-list', async ({ page }) => {
  await page.goto(`${TABLES_URL}/new`);
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Choose a template to get started')).toBeVisible();
  await shoot(page, 'table-builder-templates', await around([dialog.getByText('Choose a template to get started'), dialog.getByText('Create from scratch')], 24), { wide: true });

  await dialog.getByRole('button', { name: 'Build from this template' }).first().click();
  await shoot(page, 'table-builder-products', card(page, 'Select products to display'));
  await dialog.getByRole('button', { name: 'Next' }).click();
  await shoot(page, 'table-builder-columns', dialog.locator('[data-slot="card"]').last());
  await dialog.getByRole('button', { name: 'Next' }).click();
  await shoot(page, 'table-builder-features', dialog.locator('[data-slot="card"]').last());
  await dialog.getByRole('button', { name: 'Next' }).click();
  await dialog.locator('input[name="title"]').fill('Full Featured Table');
  await shoot(page, 'table-builder-publish', card(page, 'Publish table'));

  await page.goto(TABLES_URL);
  await expect(page.locator('tr', { hasText: TABLE })).toBeVisible();
  await shoot(page, 'product-tables-list', card(page, 'Product Tables'), { wide: true });
});

test('2. Classic theme shop: publish-use-in-shop shop-page-classic-table', async ({ page }) => {
  activateTheme(CLASSIC_THEME);
  try {
    await openBuilderStep(page, TABLE, 'Publish');
    const publish = card(page, 'Publish table');
    await shoot(page, 'publish-use-in-shop', publish, { hover: publish.getByText('Use in Shop/Category Page') });

    const tableId = await page.evaluate(() => Number(location.hash.match(/edit\/(\d+)/)?.[1]));
    await rest(page, 'yay-bulk-order/v1/product-tables/apply_to_shop', 'POST', { tableId });
    await page.goto('/shop/');
    await shoot(page, 'shop-page-classic-table', frontBlock(page, '.wp-block-yay-bulk-order-product-table-root'), { wide: true });
  } finally {
    await rest(page, 'yay-bulk-order/v1/product-tables/apply_to_shop', 'POST', { tableId: 0 });
    activateTheme(BLOCK_THEME);
  }
});

test('3. Copy as Blocks: table-actions-copy-blocks catalog-template-paste-blocks shop-page-block-table', async ({ page }) => {
  await page.goto(TABLES_URL);
  await page.locator('tr', { hasText: TABLE }).first().locator('button[aria-haspopup="menu"]').click();
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  await shoot(page, 'table-actions-copy-blocks', await around([page.locator('tr', { hasText: TABLE }).first(), menu]), {
    wide: true,
    hover: menu.getByRole('menuitem', { name: 'Copy as Blocks' }),
  });
  await menu.getByRole('menuitem', { name: 'Copy as Blocks' }).click();

  try {
    await openCatalogTemplate(page, BLOCK_THEME);
    await focusNewParagraphInMain(page);
    await page.keyboard.press('ControlOrMeta+V');
    const pasted = editorCanvas(page).locator('.wp-block-yay-bulk-order-product-table-root').first();
    await expect(pasted).toBeVisible();
    await page.evaluate(() => (window as any).wp.data.dispatch('core/block-editor').clearSelectedBlock());
    await pasted.scrollIntoViewIfNeeded();
    await shoot(page, 'catalog-template-paste-blocks', await around([pasted], 24), { wide: true });

    await saveSiteEditor(page);
    await page.goto('/shop/');
    await shoot(page, 'shop-page-block-table', frontBlock(page, '.wp-block-yay-bulk-order-product-table-root'), { wide: true });
  } finally {
    await resetCatalogTemplate(page, BLOCK_THEME);
  }
});

test('4. Copy as Shortcode: table-actions-copy-shortcode catalog-template-shortcode-block', async ({ page }) => {
  await page.goto(TABLES_URL);
  await page.locator('tr', { hasText: TABLE }).first().locator('button[aria-haspopup="menu"]').click();
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  await shoot(page, 'table-actions-copy-shortcode', await around([page.locator('tr', { hasText: TABLE }).first(), menu]), {
    wide: true,
    hover: menu.getByRole('menuitem', { name: 'Copy as Shortcode' }),
  });
  await menu.getByRole('menuitem', { name: 'Copy as Shortcode' }).click();

  try {
    await openCatalogTemplate(page, BLOCK_THEME);
    await focusNewParagraphInMain(page);
    await page.keyboard.press('ControlOrMeta+V');
    const shortcode = editorCanvas(page).locator('.wp-block-shortcode').first();
    await expect(shortcode).toBeVisible();
    await shortcode.scrollIntoViewIfNeeded();
    await shoot(page, 'catalog-template-shortcode-block', await around([shortcode], 40), { wide: true });
  } finally {
    await resetCatalogTemplate(page, BLOCK_THEME);
  }
});

test('5. Create Pattern: publish-create-pattern catalog-template-insert-pattern', async ({ page }) => {
  await openBuilderStep(page, TABLE, 'Publish');
  const publish = card(page, 'Publish table');
  await shoot(page, 'publish-create-pattern', publish, { hover: publish.getByText('Create Pattern', { exact: true }) });
  await publish.getByText('Create Pattern', { exact: true }).click();
  await expect(page.getByText('Pattern created successfully.')).toBeVisible();

  try {
    await openCatalogTemplate(page, BLOCK_THEME);
    await focusNewParagraphInMain(page);
    await page.getByRole('button', { name: 'Block Inserter' }).click();
    await page.getByRole('tab', { name: 'Patterns' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill(TABLE);
    const option = page.getByRole('option', { name: TABLE }).first();
    await expect(option).toBeVisible();
    const searchbox = page.getByRole('searchbox', { name: 'Search' });
    await shoot(page, 'catalog-template-insert-pattern', await around([page.getByRole('tab', { name: 'Patterns' }), searchbox, option], 24), { hover: option });
  } finally {
    await resetCatalogTemplate(page, BLOCK_THEME);
  }
});

test('6. Create with new page: publish-create-new-page new-page-editor-table', async ({ page }) => {
  await openBuilderStep(page, TABLE, 'Publish');
  const publish = card(page, 'Publish table');
  const create = publish.getByRole('button', { name: 'Create', exact: true });
  await shoot(page, 'publish-create-new-page', publish, { hover: create });

  const newTab = page.context().waitForEvent('page');
  await create.click();
  const editor = await newTab;
  await editor.waitForFunction(() => (window as any).wp?.data?.select('core/block-editor')?.getBlocks().length > 0);
  await editor.evaluate(() => (window as any).wp.data.dispatch('core/editor').editPost({ title: 'Clothing Order Form' }));
  await editor.waitForTimeout(1000);
  const canvas = editorCanvas(editor);
  await shoot(editor, 'new-page-editor-table', await around([canvas.locator('.editor-post-title').first(), canvas.locator('.wp-block-yay-bulk-order-product-table-root').first()], 24), { wide: true });
  await editor.close({ runBeforeUnload: false });
});

test('7. Purchase List: my-account-purchase-lists purchase-list-detail purchase-list-added-to-cart', async ({ page }) => {
  await page.goto('/my-account/');
  await emptyCart(page);
  await page.goto('/my-account/yaybulkorder-purchase-list/');
  // Brandy's My Account: the menu and the content side by side.
  const lists = page.locator('.my-account-wrapper');
  await expect(lists.getByText('Weekly Restock')).toBeVisible();
  await shoot(page, 'my-account-purchase-lists', lists, { wide: true });

  await lists.locator('tr', { hasText: 'Weekly Restock' }).getByRole('button', { name: 'View' }).click();
  await expect(lists.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
  await shoot(page, 'purchase-list-detail', lists, { wide: true });

  await lists.getByRole('button', { name: 'Add to Cart' }).click();
  await expect.poll(() => cartQuantities(page)).not.toEqual({});
  await page.goto('/cart/');
  await waitForCartBlock(page);
  await shoot(page, 'purchase-list-added-to-cart', page.locator('.wp-block-woocommerce-cart, .woocommerce-cart-form').first(), { wide: true });
});

test('8. Save as Purchase List: save-purchase-list-cart save-purchase-list-mini-cart save-purchase-list-checkout save-purchase-list-order-details', async ({ page }) => {
  await page.goto('/my-account/');
  await emptyCart(page);
  await page.goto(`/?add-to-cart=${await productIdBySku(page, 'woo-fashion-hat')}&quantity=2`);
  const saveButton = page.getByRole('button', { name: 'Save as Purchase list' }).filter({ visible: true }).first();

  await page.goto('/cart/');
  await expect(saveButton).toBeVisible();
  await waitForCartBlock(page);
  await shoot(page, 'save-purchase-list-cart', await around([page.locator('.wp-block-woocommerce-cart-totals-block, .cart_totals').first(), saveButton]));

  await page.goto('/');
  await page.locator('header .brandy-cart-a').first().click();
  await expect(saveButton).toBeVisible();
  const miniCart = saveButton.locator('xpath=ancestor::*[contains(@class,"mini-cart") or contains(@class,"widget_shopping_cart") or contains(@class,"brandy-cart")][1]');
  await shoot(page, 'save-purchase-list-mini-cart', (await miniCart.count()) ? miniCart.first() : await around([saveButton], 120));

  await page.goto('/checkout/');
  await expect(saveButton).toBeVisible();
  await waitForCartBlock(page);
  // The sidebar: the order summary also has a hidden copy for small screens.
  await shoot(page, 'save-purchase-list-checkout', page.locator('.wc-block-checkout__sidebar').first());

  const orders = await rest<{ id: number }[]>(page, 'wc/v3/orders?customer=1&status=completed&per_page=1');
  await page.goto(`/my-account/view-order/${orders.body[0].id}/`);
  await expect(saveButton).toBeVisible();
  await shoot(page, 'save-purchase-list-order-details', await around([page.locator('.woocommerce-order-details').first(), saveButton]), { wide: true });
});

test('9. Quick Order: my-account-quick-order quick-order-upload quick-order-added-to-cart', async ({ page }) => {
  await page.goto('/my-account/');
  await emptyCart(page);
  await page.goto('/my-account/yaybulkorder-quick-order/');
  const content = page.locator('.my-account-wrapper');
  await expect(content.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
  await shoot(page, 'my-account-quick-order', content, { wide: true });

  await content.locator('input[type="file"][name="ybod_csv_order"]').setInputFiles(CSV_FILE);
  await expect(content.getByText('quick-order.csv')).toBeVisible();
  await shoot(page, 'quick-order-upload', content, { wide: true });

  await content.getByRole('button', { name: 'Add to Cart' }).click();
  await expect.poll(() => cartQuantities(page)).not.toEqual({});
  await page.goto('/cart/');
  await waitForCartBlock(page);
  await shoot(page, 'quick-order-added-to-cart', page.locator('.wp-block-woocommerce-cart, .woocommerce-cart-form').first(), { wide: true });
});

test('10. Own block design: table-block-color-settings table-custom-design-front', async ({ page }) => {
  const patterns = await rest<{ name: string; content: string }[]>(page, 'wp/v2/block-patterns/patterns');
  const content = patterns.body.find((p) => p.name === 'yay-bulk-order/simple-product-table')!.content;
  const created = await rest<{ id: number; link: string }>(page, 'wp/v2/pages', 'POST', {
    title: 'Bulk Order',
    slug: 'docs-block-design',
    status: 'publish',
    content,
  });

  await page.goto(`/wp-admin/post.php?post=${created.body.id}&action=edit`);
  await editorCanvas(page).locator('.wp-block-yay-bulk-order-product-table-header').first().click();
  await page.getByRole('button', { name: 'Table', exact: true }).last().click();
  await page.getByRole('tab', { name: 'Settings' }).click().catch(() => {});
  for (const [label, hex] of [['Header Background Color', '1f3a5f'], ['Header Text Color', 'ffffff']] as const) {
    await page.getByRole('button', { name: label }).click();
    await page.getByRole('button', { name: 'Custom color picker' }).click();
    await page.getByRole('textbox', { name: 'Hex color' }).fill(hex);
    await page.getByRole('textbox', { name: 'Hex color' }).press('Enter');
    await page.keyboard.press('Escape');
  }
  const headerBg = page.getByRole('button', { name: 'Header Background Color' });
  await headerBg.scrollIntoViewIfNeeded();
  const colorPanels = ['Header Background Color', 'Header Text Color'].map((label) =>
    page.locator('.components-tools-panel').filter({ has: page.getByRole('button', { name: label }) }).last(),
  );
  await shoot(page, 'table-block-color-settings', await around(colorPanels, 0));

  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => {
    const editor = (window as any).wp.data.select('core/editor');
    return !editor.isSavingPost() && !editor.isEditedPostDirty();
  });
  await page.goto(created.body.link);
  await shoot(page, 'table-custom-design-front', frontBlock(page, '.wp-block-yay-bulk-order-product-table-root'), { wide: true });
});

test('11. Variant Table: variant-table-front variant-table-selected', async ({ page }) => {
  const created = await rest<{ id: number; link: string }>(page, 'wp/v2/pages', 'POST', {
    title: 'Sweater Sizes',
    slug: 'docs-variant-table',
    status: 'publish',
    content: '',
  });
  await page.goto(`/wp-admin/post.php?post=${created.body.id}&action=edit`);
  await page.getByRole('button', { name: 'Block Inserter' }).click();
  await page.getByRole('searchbox', { name: 'Search' }).fill('Variant Table');
  await page.getByRole('option', { name: 'Variant Table', exact: true }).first().click();
  const canvas = editorCanvas(page);
  await canvas.locator('input[type="text"]').first().fill('Sweater');
  await canvas.getByRole('option', { name: 'Sweater' }).first().click();
  await expect(canvas.locator('.wp-block-yay-bulk-order-variant-table-header')).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => {
    const editor = (window as any).wp.data.select('core/editor');
    return !editor.isSavingPost() && !editor.isEditedPostDirty();
  });

  await page.goto('/my-account/');
  await emptyCart(page);
  await page.goto(created.body.link);
  const table = frontBlock(page, '.wp-block-yay-bulk-order-variant-table-root');
  await expect(page.locator('tr.yay-bulk-order-variant-table-row')).toHaveCount(3);
  await shoot(page, 'variant-table-front', table, { wide: true });

  const rows = page.locator('tr.yay-bulk-order-variant-table-row');
  for (const [index, quantity] of [[1, 4], [2, 2]] as const) {
    await rows.nth(index).locator('.ybod-quantity-input').fill(String(quantity));
    await rows.nth(index).getByRole('checkbox').check();
  }
  await shoot(page, 'variant-table-selected', table, { wide: true });
});
