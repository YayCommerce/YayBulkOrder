---
tags: [context, reference]
triggers: [which plugin, list of plugins, all plugins, addon list, bulk-order-pro, free version, pro version, license]
---

# Plugin List

Bottom line: edition (Lite vs Pro) is fixed at build time, not a runtime toggle, and — unlike the sister plugins — licensing is not actually enforced yet. Single codebase.

---

## Core

| Plugin | Slug | Notes |
|--------|------|-------|
| Yay Bulk Order for WooCommerce (Lite) | `yay-bulk-order` | Public build. `release.sh IS_PRO=false` deletes `includes/Pro/`, `assets/pro/`, and the Pro-only `assets/dist/*` bundles. Bootstrap: `yay-bulk-order.php` |
| Yay Bulk Order Pro | `yay-bulk-order-pro` | Same codebase. Keeps `includes/Pro/` and `assets/pro/`. `release.sh IS_PRO=true` swaps the main file to `assets/pro/yay-bulk-order-pro.php` and deletes the lite bootstrap. |

Both built from this repo. There is no separate source tree for Pro — just `includes/Pro/` stripped out of the Lite build.

---

## How edition detection works (and what's unfinished)

1. `YayBulkOrder::is_pro()` checks `class_exists('YayBulkOrder\Pro\YayBulkOrderPro')`. True only if Pro files shipped — same mechanism as sister plugin YayWholesale B2B.
2. **Licensing is not wired up.** [YayBulkOrderProLicenseAdapter.php](../../includes/Pro/YayBulkOrderProLicenseAdapter.php) has an `is_licensed()` method (checks options `yay-bulk-order-pro_license_key` / `..._license_info`), but nothing calls it. `Pro\YayBulkOrderPro`'s constructor has the license gate commented out (`// TODO: EDD setup`) — any Pro build runs fully unlocked. `get_item_id()` also still returns the placeholder `1` (`// TODO: EDD setup`).
3. Menu registration bug: `Pro\YayBulkOrderPro::register_admin_menu()` uses the **Lite** `YayBulkOrderLicenseAdapter`, not the Pro one — the Pro line is commented out. See [context-project-structure.md](context-project-structure.md) "Known inconsistencies".
4. Frontend build: `pnpm build:admin:pro` vs `pnpm build:admin:lite` (admin SPA), `pnpm build` vs `pnpm build:pro` (blocks). Separate Vite/wp-scripts modes.
5. There is currently no visible Pro-gate UI pattern in the admin SPA (no "Upgrade to unlock" component found) — Pro pages are simply absent from a Lite build rather than shown-but-locked.

**When touching license/upsell code**: treat this as a genuinely half-built area, not a stable contract. Confirm the intended EDD item ID and license flow with the team before extending it.

---

## Pro-only modules

All under `includes/Pro/`.

| Feature | Files |
|---|---|
| Purchase List (save/reload a named cart for reorder) | `Engines/Blocks/PurchaseList.php`, `Services/PurchaseListService.php`, `Controllers/PurchaseListRestController.php`, `apps/blocks-pro/src/purchase-list`, `apps/packages/purchase-list-store` |
| Quick CSV Order (bulk add-to-cart from an uploaded CSV) | `Engines/Blocks/CSVOrder.php`, `Services/CSVOrderService.php`, `apps/blocks-pro/src/{csv-ordering,quick-csv-order}` |
| Variant Table (per-product variation ordering table) | `Services/VariantTableService.php`, `apps/blocks-pro/src/variant-table/*`, `apps/packages/variant-table-store` |
| Pro storefront scripts + checkout slot-fill ("Save as Purchase List" on checkout) | `Engines/Frontend/Frontend.php`, `apps/packages/block-checkout-slotfill` — built by `pnpm run build:checkout-slotfill`, wired into `release.sh`'s Pro branch (fixed 2026-09-22, see below) |
| Pro block patterns (purchase-list, csv-order, some-categories table, variant-table) | `Engines/Blocks/RegisterBlocks.php` (`pro_patterns` filter on `yaybulkorder_block_patterns`) |
| Pro REST routes | `Engines/RestAPI.php` |

Note: the base Product Table block/CPT/builder ships in Lite. Purchase List and CSV Order are entirely Pro-only — there is no crippled/preview version in Lite.

---

## Core/Lite features

Always shipped, in `includes/` root.

| Area | Files |
|---|---|
| Product Table CPT + builder (query by all/category/featured/on-sale/hand-picked; columns; filter/search/pagination toggles) | `Engines/Admin/ProductTable.php`, `Services/ProductTablesService.php`, `Controllers/ProductTablesRestController.php` |
| `[ybo-product-table]` shortcode + shop-page table replacement | `Engines/Shortcodes/ProductTableShortcode.php`, `Engines/Frontend/StorePage.php` |
| Product search / category lookup for the table builder | `Controllers/ProductQueryRestController.php`, `Services/ProductQueryService.php` |
| Plugin settings (colors, default cart qty/page size, style) | `Controllers/SettingsRestController.php`, `Services/SettingsService.php` |
| Price resolution (defers to third-party pricing plugins) | `Services/PricingService.php` |
| "Any"-attribute variation resolution | `Services/VariationAttributeService.php` |
| Third-party compatibility | `Engines/Compatibles/*` (YayWholesale, YayPricing, RocketLoader) |
| Core REST API | `Engines/RestAPI.php` |
| Admin SPA: Home/QuickStart, Product Tables list+builder, Settings (general/design/advanced) | `apps/app-admin` |

---

## Release build details

- `.distignore` strips dev-only paths from both builds: `.vscode`, `.claude`, `.github`, `apps`, `tools`, `release`, `node_modules`, `phpcs.xml`, config/lint files, `vendor/bin`, `vendor/yaycommerce`. Only compiled `assets/dist` output ships.
- `includes/Engines/Register/RegisterDev.php` is deleted from **both** builds by `release.sh` (`rm -rf "$DEST_PATH/includes/Engines/Register/RegisterDev.php"`).
- Lite-only stripping: `includes/Pro/`, `assets/pro/`, `assets/dist/blocks-pro`, `assets/dist/variant-table-store`, `assets/dist/purchase-list-store`; then `composer dump-autoload --optimize --no-dev` is re-run against the stripped tree so the PSR-4 map doesn't reference deleted Pro classes.
- Pro-only step: `assets/pro/yay-bulk-order-pro.php` is copied to the build root (becoming the active main file) and the Lite `yay-bulk-order.php` is deleted.
- Pro branch also runs `pnpm run build:checkout-slotfill` (added 2026-09-22 — previously `apps/packages/block-checkout-slotfill` was never built by any script, so every past release zip shipped without it and the checkout slot-fill silently did nothing; see `context-project-structure.md` "Known inconsistencies" for the history).
- Build toolchain requires **PHP 8.3** specifically (`release.sh` hard-fails under 8.0–8.2, warns if not exactly 8.3) — run with `PATH="/opt/homebrew/opt/php@8.3/bin:$PATH" ./release.sh IS_PRO=true` on machines where the default `php` is a different version.
- `./vendor/bin/yaycommerce-prerelease` runs before packaging (same convention as sister plugins).
- Commands: `pnpm release` (both), `pnpm release:lite`, `pnpm release:pro`.

---

## Version info

- Plugin header: "Yay Bulk Order for WooCommerce", current version `0.2.1.5` — a 4-segment scheme, not the `X.Y.Z` / `X.Y.Z-rcN` scheme used by sister plugins. There is no established pre-release suffix convention here yet; `/wdist-staging` asks before assuming one.
- Version is defined in **two places per file, two files total**: the `Version:` header comment and the `define( 'YAYBULKORDER_VERSION', ... )` constant, in both `yay-bulk-order.php` (Lite) and `assets/pro/yay-bulk-order-pro.php` (Pro) — all four must stay in sync.
- No `readme.txt` exists yet in this repo (unlike YayWholesale/YayBookster) — nothing else to update on a version bump.
