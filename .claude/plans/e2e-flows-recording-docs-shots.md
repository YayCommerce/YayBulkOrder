# Plan: E2E flows, recording mode and docs screenshots

## Goal

Add 11 end-to-end tests with an opt-in recording mode, plus a `docs:shots` command that saves cropped WebP screenshots of the same 11 flows into the docs repo.

## Approach

### A. Recording mode

- `pnpm test:e2e:record` sets `RECORD=1`.
- Video is recorded only in this mode. Normal runs: no video locally, video on failure in CI. This replaces the current `VIDEO = 'on'`.
- Playwright pauses between steps (`slowMo`), 800 ms by default, set with `RECORD_DELAY`.
- One-time setup: `playwright install ffmpeg`.
- Screenshots stay on for every test.

### B. Test site setup and 11 e2e tests

Setup:

- `.wp-env.json`: add Twenty Twenty-One as the classic theme. Twenty Twenty-Five is the block theme.
- `bin/seed.sh`: a variable product with variations, one completed order (order details page), a CSV file for Quick Order.
- `utils/wp-cli.ts`: switch theme and reset data between tests.
- `utils/site-editor.ts`: open and save the Catalog template, and reset it after each test.
- Clipboard permission for the copy and paste tests.
- Pro features run because the license check in `YayBulkOrderPro.php` is commented out locally. Check first that the Pro admin page does not redirect to Licenses; if it does, stop and ask.

Specs (all `*.admin.spec.ts`):

| # | Test | Spec | Checks |
|---|---|---|---|
| 1 | Table Builder | `table-builder` | Products, Columns, Features, Publish steps create a table, and the list shows it |
| 2 | Catalog template, classic theme | `shop-classic` | Twenty Twenty-One + "Use in Shop/Category Page": `/shop/` shows the table; remove it |
| 3 | Copy as Blocks → Catalog template, block theme | `catalog-template` | Paste in the Site Editor, save, `/shop/` shows the table |
| 4 | Copy as Shortcode → Catalog template | `catalog-template` | Paste into a Shortcode block, save, `/shop/` shows the table |
| 5 | Create Pattern → Catalog template | `catalog-template` | Insert the pattern, save, `/shop/` shows the table |
| 6 | Create with new page, block theme | `new-page` | The editor opens for a new page with a Product Table block set up like the source table (columns and order, products query, features). Nothing is published or saved. |
| 7 | Purchase List in My Account | `purchase-list` | Open a list, add it to the cart, the cart has its items |
| 8 | Save as Purchase List button | `purchase-list` | Visible on cart, mini cart, checkout and order details. On the cart page only, clicked once: the list shows in My Account with the cart's items; the test deletes it |
| 9 | Quick Order in My Account | `quick-order` | Upload the test CSV, the cart has its items |
| 10 | Own block design | `block-design` | Set Table block colors in the editor, the front end shows them |
| 11 | Variant Table | `variant-table` | Variation rows render, selected variations go to the cart |

Each test restores the theme, template and cart it changed.

### C. Docs screenshots (modelled on Bookster `tools/docs-shots`)

- `pnpm docs:shots [name…]`: a separate wp-env site on port 8891 (no mixing with e2e data), seeds it, saves each shot. Output: `~/Projects/YayCommerceDocs/yaybulkorder/.gitbook/assets`, changeable with `YBO_DOCS_DIR`.
- `tests/e2e/docs-shots/seed.php`: realistic products with images (incl. variable), saved tables, purchase lists, one order, the Quick Order CSV. Rerunnable. Images download once (network on first seed).
- `shots.spec.ts`: manifest of image names (a run replaces only its own files); `beforeEach` hides notices, admin bar and caret; `shoot()` blurs and clears hover, waits for the network and fonts, PNG, then WebP at lower quality until under 1 MB and 1600 px wide, fails if the crop is too wide; `around()` and an animation wait for dialogs and menus.
- Docs repo rules (`README.md` › Images, `STYLE.md` › Screenshots): WebP, ≤ 1 MB, ≤ 1600 px, cropped to the panel, named after what it shows.

Shots, one per step:

1. `table-builder-templates`, `table-builder-products`, `table-builder-columns`, `table-builder-features`, `table-builder-publish`, `product-tables-list`
2. `publish-use-in-shop`, `shop-page-classic-table`
3. `table-actions-copy-blocks`, `catalog-template-paste-blocks`, `shop-page-block-table`
4. `table-actions-copy-shortcode`, `catalog-template-shortcode-block`
5. `publish-create-pattern`, `catalog-template-insert-pattern`
6. `publish-create-new-page`, `new-page-editor-table`
7. `my-account-purchase-lists`, `purchase-list-detail`, `purchase-list-added-to-cart`
8. `save-purchase-list-cart`, `save-purchase-list-mini-cart`, `save-purchase-list-checkout`, `save-purchase-list-order-details`
9. `my-account-quick-order`, `quick-order-upload`, `quick-order-added-to-cart`
10. `table-block-color-settings`, `table-custom-design-front`
11. `variant-table-front`, `variant-table-selected`

## Checkpoints

1. Everything above — the full e2e suite passes, with screenshots and one recorded video; `pnpm docs:shots` writes the 30 images into the docs repo (not committed there; the user reviews and commits them).

## Out of Scope

- CI workflow changes.
- Fixing plugin bugs the tests find (reported only).
- Real license activation, YayWholesale, YayPricing.
- Lite-only test runs.
- Writing the docs pages; docs GIFs.

## Meta

- Target branch: dev/review-refactor
- Base branch: develop
- Docs output: ~/Projects/YayCommerceDocs/yaybulkorder/.gitbook/assets
