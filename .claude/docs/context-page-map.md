---
tags: [context, reference, pages, features]
triggers: [page map, feature map, admin pages, frontend pages, what pages exist, drawer, list, REST API endpoints, planning, blocks, patterns, shortcode]
---

# Page Map

Feature map — pages, what they contain, how they relate. Use when planning to understand scope and affected areas.

Bottom line: one WP admin menu page mounts a React SPA. Storefront features are Gutenberg blocks, a shortcode, and classic-theme shop-loop replacement.

---

## Admin SPA — `/wp-admin/admin.php?page=yay_bulk_order`

Router: [router.tsx](../../apps/app-admin/src/router.tsx), React Router `createHashRouter`. URLs look like `admin.php?page=yay_bulk_order#/home`.

| Page | Route | Contains |
|------|-------|----------|
| Home | `/home` (default redirect from `/`) | `Features` cards, `QuickStart` panel |
| Product Tables | `/product-tables`, `/product-tables/new`, `/product-tables/edit/:tableId` | Renders **both** `TableBuilder` and `TablesList` together — `TableBuilder` reacts to the `new`/`edit/:tableId` route to open its step flow (Query/Columns/Features/Publish steps), `TablesList` always shows the saved-tables list below it |
| Settings | `/settings/:subMenu` | Tabbed settings screen, default redirect to `general` |

Error routes: `pages/404.tsx`, `pages/500.tsx`.

### Settings sub-tabs (`pages/settings/tabs/`)

| Sub-tab | Contains |
|---|---|
| `general` | Default cart quantity, default page size |
| `design` | Color preset editor + live `DesignPreviewTable` |
| `advanced` | Misc/advanced settings |

### Table Builder steps (`pages/product-tables/table-builder/steps/`)

`ProductsStep` (query by all/category/featured/on-sale/hand-picked) → `ColumnsStep` (pick+order columns) → `FeaturesStep` (filter/search/pagination toggles) → `PublishStep`. `TablePrebuild`/`TablePreview` handle the "start from a pattern" preview.

---

## WP Admin — Other (PHP-registered)

No per-feature `add_menu_page` call in this plugin. Menu wiring is shared across YayCommerce plugins via the vendor-prefixed AdminShell library (same mechanism as sister plugins).

| Menu | Slug | Registered by |
|---|---|---|
| YayCommerce (top-level, shared) | `yaycommerce` | `vendor-prefixed/src/Menu/TopLevelMenu.php` |
| Yay Bulk Order (submenu) | `yay_bulk_order` | `vendor-prefixed/src/Menu/PluginSubmenu.php`, config from [YayBulkOrderLicenseAdapter.php](../../includes/YayBulkOrderLicenseAdapter.php) — used for **both** Lite and Pro today, see the menu-adapter note in `context-project-structure.md`. Cap `manage_woocommerce`. |

Other admin-area hooks (not separate pages):

| Area | File | Purpose |
|---|---|---|
| Product Table CPT | [ProductTable.php](../../includes/Engines/Admin/ProductTable.php) | Registers `yaybulkorder_table` (non-public, REST-enabled, `rest_base=table-prebuilds`), and swaps stashed block content into a freshly auto-drafted Page (the "apply to a new page" flow) |
| Plugin action links / body class / asset enqueue | [AdminPage.php](../../includes/Engines/Admin/AdminPage.php) | "Settings" row action link on the plugins list, `yay-ui` body class, enqueues the admin SPA bundle only on the `yaycommerce_page_yay_bulk_order` hook suffix |

---

## Frontend — Gutenberg blocks (`apps/blocks/`, `apps/blocks-pro/`)

| Block area | Path | Purpose |
|------|-----|----------|
| Product Table | `blocks/src/product-table/` | Root table block + column sub-blocks (`column-{product,description,sku,quantity,select,subtotal,add-to-cart}`), plus `table-{header,footer,filter,filter-sidebar,search,pagination,bulk-action,columns,root}` supporting blocks. Interactivity state via `apps/packages/product-table-store`. |
| Common | `blocks/src/common/cart-summary` | Floating cart-summary widget shared across table types |
| Variant Table (Pro) | `blocks-pro/src/variant-table/` | Per-product variation ordering table — root/table/columns + `column-{description,product,quantity,sku,select,subtotal}`. State: `apps/packages/variant-table-store`. Product resolution: `Pro\Services\VariantTableService` (auto-detects `postId` on Single Product, else the editor-picked `productId`). |
| Purchase List (Pro) | `blocks-pro/src/purchase-list/` | Save/reload a named list of products for reorder. State: `apps/packages/purchase-list-store`. Backend: `Pro\Engines\Blocks\PurchaseList.php` (ajax handlers + CPT `yaybulkorder_plist`), REST: `PurchaseListRestController`. |
| CSV / Quick Order (Pro) | `blocks-pro/src/{csv-ordering,quick-csv-order}` | Bulk add-to-cart from an uploaded CSV file. Backend: `Pro\Engines\Blocks\CSVOrder.php`, `Pro\Services\CSVOrderService.php`. |
| Product Table Columns (Pro) | `blocks-pro/src/product-table-columns-pro/` | Pro-only extra column(s) for the Product Table block |
| Checkout slot-fill (Pro) | `apps/packages/block-checkout-slotfill` | Injects a "Save as Purchase List" action into the WooCommerce Blocks checkout, enqueued by `Pro\Engines\Frontend\Frontend.php` |

### Product Table filter sidebar — URL scheme

`table-filter-sidebar` filters (category, tag, price range, rating) and `table-pagination`/`table-search` all read/write GET params named `query-{queryId}-{param}` (e.g. `?query-1-categories=dictionary,clothing&query-1-tags=aa&query-1-min-price=10&query-1-max-price=100&query-1-rating=4`), built by `BlockHelper::build_query_url()` / `BlockHelper::get_*_param()`. Category and tag are multi-select (comma-separated, OR within the same taxonomy, AND across categories vs tags). Rating is a single "N stars & up" threshold. `filter` (on-sale/in-stock) keeps the same `query-{id}-filter` scheme but is a separate, older param — not part of this filter set.

**`queryId` collision fix**: a static pattern (e.g. "Simple Product Table") inserted twice on one page bakes the *same* `queryId` into both instances' saved attributes — the block editor renumbers this automatically when both blocks are visible together in the editor (`table-root/edit.tsx`), but that never runs for content assembled outside the editor (the `[yaybulkorder-product-table]` shortcode always bakes `queryId: 1`; programmatic content — stashed "apply to a new page", migrations, tests — can too). `Engines\Blocks\RegisterBlocks::disambiguate_query_id()` hooks WordPress's `render_block_data` filter to rewrite the 2nd+ occurrence's `queryId` before context resolution, so every descendant block and the table's own `data-wp-router-region` see a collision-free value with no other code needing to know about it.

## Frontend — PHP templates / shortcode

| Item | Purpose |
|---|---|
| `[yaybulkorder-product-table]` shortcode | [ProductTableShortcode.php](../../includes/Engines/Shortcodes/ProductTableShortcode.php) — renders the default Product Table block markup outside the block editor |
| `includes/Engines/Shortcodes/templates/product-table-default.php` | Shortcode render target on ordinary pages |
| `includes/Engines/Shortcodes/templates/product-table-archive.php` | Shortcode render target on shop/product-archive pages |
| `includes/Engines/Shortcodes/templates/parts/product-table.php` | Shared table markup partial |
| Classic-theme shop loop replacement | [StorePage.php](../../includes/Engines/Frontend/StorePage.php) — buffers and replaces `woocommerce_before/after_shop_loop` output when a table is applied via `Services/ProductTablesService::is_applied_table_to_shop()` |
| `includes/Engines/Compatibles/YayWholesale/templates/product-table-shop.php` | Compat render path when YayWholesale B2B is active |

## Block Patterns

Registered in [PatternRegistry.php](../../includes/Engines/Blocks/Patterns/PatternRegistry.php) (Lite) and via the `yaybulkorder_block_patterns` filter in [Pro/Engines/Blocks/RegisterBlocks.php](../../includes/Pro/Engines/Blocks/RegisterBlocks.php) (Pro). Content files live in `patterns/*.php`, rendered by `Services/PatternService`.

| Pattern slug | Edition | Content file |
|---|---|---|
| `yay-bulk-order/full-featured-product-table` | Lite | `patterns/product-table__full-features.php` |
| `yay-bulk-order/simple-product-table` | Lite | `patterns/product-table__simple.php` |
| `yay-bulk-order/purchase-list` | Pro | `patterns/purchase-list.php` |
| `yay-bulk-order/csv-order` | Pro | `patterns/csv-order.php` |
| `yay-bulk-order/some-categories-product-table` | Pro | `patterns/product-table__some-categories.php` |
| `yay-bulk-order/variant-table` | Pro | `patterns/variant-table.php` |

`patterns/simple.php` and `patterns/filterable.php` exist but are **not registered** — see the "Known inconsistencies" note in `context-project-structure.md` before building on them.

---

## REST API

Namespace: `yay-bulk-order/v1` ([BaseRestController.php](../../includes/Controllers/BaseRestController.php)).

Browser console — `wpApiSettings.nonce` available on any WP admin page:

```js
fetch('/wp-json/yay-bulk-order/v1/<endpoint>', { headers: { 'X-WP-Nonce': wpApiSettings.nonce } })
  .then(r => r.json()).then(console.log)
```

| Method | Route | Controller | Purpose |
|---|---|---|---|
| GET | `/product-tables` | ProductTablesRestController | Paginated product-table list |
| POST | `/product-tables` | ProductTablesRestController | Create a table |
| GET/PUT/DELETE | `/product-tables/{id}` | ProductTablesRestController | Get/update/delete a table |
| DELETE | `/product-tables/bulk-delete` | ProductTablesRestController | Bulk delete |
| POST | `/product-tables/stash` | ProductTablesRestController | Stash block content for a new Page (auto-draft flow) |
| POST | `/product-tables/apply_to_shop` | ProductTablesRestController | Apply a table to the shop archive page |
| GET | `/product-categories` | ProductQueryRestController | Category checklist for the table builder |
| GET | `/product-search` | ProductQueryRestController | Hand-picked product search for the table builder |
| GET | `/settings` | SettingsRestController | Fetch settings |
| POST | `/settings` | SettingsRestController | Update settings |
| POST | `/mark-reviewed` | SettingsRestController | Dismiss review nudge |
| POST | `/purchase-list` (Pro) | Pro\Controllers\PurchaseListRestController | Create a purchase list |
| PUT/DELETE | `/purchase-list/{list_id}` (Pro) | Pro\Controllers\PurchaseListRestController | Update/delete a purchase list |
| GET | `/purchase-list/{list_id}/download` (Pro) | Pro\Controllers\PurchaseListRestController | Download purchase list as CSV |

There is also a non-REST ajax surface for Purchase List used by storefront widgets (not the admin SPA): `wp_ajax_ybod_add_purchase_list_to_cart`, `wp_ajax_ybod_save_purchase_list_from_cart`, `wp_ajax_ybod_save_purchase_list_from_order` (all in `Pro\Engines\Blocks\PurchaseList.php`, logged-in only — no `nopriv` variants).
