---
tags: [context, reference, backend, frontend, workflow]
triggers: [project structure, directory structure, folder structure, where does this go, bootstrap, hook order, plugins_loaded, rest_api_init, singleton, register_rest_route, new controller, new engine class, where to put a new file]
---

# Project Structure

Bottom line: PHP is layered `Engine → Controllers → Services`, everything is a `SingletonTrait` singleton wired up through one bootstrap chain. Getting the hook timing wrong in that chain causes silent failures (e.g. 404 on a REST route) — see "Hook timing" below before adding any new singleton class.

---

## Directory layout

```
yay-bulk-order.php              Lite bootstrap (plugins_loaded → plugin_init)
assets/pro/yay-bulk-order-pro.php   Pro bootstrap (same, swapped in Pro build)

includes/
  YayBulkOrder.php               Core singleton — wires up all Lite engines + gates Pro
  YayBulkOrderLicenseAdapter.php Lite AdminShell menu adapter
  Fallback.php                   Shown if two copies of the plugin are active at once
  I18n.php                       Text domain loading
  Controllers/                   Core REST controllers (extend BaseRestController)
  Engines/
    Admin/                       AdminPage (menu/enqueue), ProductTable (CPT registration)
    Blocks/                      RegisterBlocks (block.json collections), Patterns/PatternRegistry
    Compatibles/                 Third-party plugin compat shims (YayWholesale, YayPricing, RocketLoader)
    Frontend/                    StorePage (classic-theme shop loop replacement)
    Register/                    RegisterFacade, RegisterDev/RegisterProd, ScriptName
    Shortcodes/                  ProductTableShortcode + PHP view templates
    RestAPI.php                  Core REST bootstrap (rest_api_init → controllers)
    ActDeact.php                 Activation/deactivation/uninstall hooks
  Services/                      Business logic, static-ish singletons, no WP hooks
  Utils/                         SingletonTrait, BlockHelper

includes/Pro/                    Stripped from Lite build by release.sh
  YayBulkOrderPro.php            Pro singleton — wires up all Pro engines
  YayBulkOrderProLicenseAdapter.php  Has is_licensed(), NOT currently called (see context-plugin-list.md)
  Controllers/                   Pro REST controllers
  Engines/
    Blocks/                      PurchaseList, CSVOrder, RegisterBlocks (Pro block collection + Pro patterns)
    Frontend/                    Frontend.php — Pro storefront scripts + checkout slotfill
    RestAPI.php                  Pro REST bootstrap (rest_api_init → Pro controllers)
  Services/                      PurchaseListService, CSVOrderService, VariantTableService

patterns/                        PHP block-pattern content, rendered by Services/PatternService

apps/
  app-admin/                     React 18 + TS admin SPA (Vite), build:lite / build:pro
  blocks/                        Lite Gutenberg blocks (product-table, common), wp-scripts
  blocks-pro/                    Pro Gutenberg blocks (variant-table, purchase-list, csv-ordering), wp-scripts
  packages/
    common/                      Shared TS schemas/types/storeApi helpers
    block-checkout-slotfill/     Pro checkout slot-fill UI (Save Purchase List from checkout)
    product-table-store/         @wordpress/interactivity store for the Product Table block
    variant-table-store/         Pro — interactivity store for the Variant Table block
    purchase-list-store/         Pro — interactivity store for Purchase List UI
  tests/e2e/                     Stub only — see context-dev-convention.md, e2e is NOT wired up yet
```

Namespace mirrors path 1:1: `YayBulkOrder\Engines\Admin\ProductTable` → `includes/Engines/Admin/ProductTable.php`; Pro: `YayBulkOrder\Pro\Engines\Blocks\PurchaseList` → `includes/Pro/Engines/Blocks/PurchaseList.php` (PSR-4 autoloader via `composer.json`).

---

## Bootstrap chain (order matters)

```
plugins_loaded
  → plugin_init()
      → YayBulkOrder::initialize()                    (includes/YayBulkOrder.php)
          → Engines\Register\RegisterFacade::get_instance()
          → Engines\Blocks\RegisterBlocks::get_instance()
          → Engines\Shortcodes\ProductTableShortcode::get_instance()
          → Engines\Admin\AdminPage::get_instance()
          → Engines\Admin\ProductTable::get_instance()      registers yaybulkorder_table CPT
          → Engines\RestAPI::get_instance()                 hooks bulk_order_endpoints() on rest_api_init
          → Engines\Frontend\StorePage::get_instance()
          → Engines\Blocks\Patterns\PatternRegistry::get_instance()
          → Engines\Compatibles\Compatibles::get_instance()
          → if is_pro(): Pro\YayBulkOrderPro::initialize()
              → Pro\Engines\Blocks\PurchaseList / CSVOrder / Frontend::get_instance()
              → Pro\Engines\RestAPI::get_instance()          hooks bulk_order_endpoints() on rest_api_init
              → Pro\Engines\Blocks\RegisterBlocks::get_instance()
              → register_admin_menu() (AdminShell)
          → else: register_admin_menu() (AdminShell)

rest_api_init
  → Engines\RestAPI::bulk_order_endpoints()      → SettingsRestController, ProductQueryRestController, ProductTablesRestController
  → Pro\Engines\RestAPI::bulk_order_endpoints()  → Pro\Controllers\PurchaseListRestController
```

`is_pro()` = `class_exists('YayBulkOrder\Pro\YayBulkOrderPro')` (Pro files present). Same mechanism as sister plugin YayWholesale — separate from licensing. See [context-plugin-list.md](context-plugin-list.md) for the current (unfinished) licensing state.

---

## Hook timing: register routes directly, don't nest `rest_api_init`

`*Engines\RestAPI::get_instance()` (both core and Pro) is itself called **from inside** the `rest_api_init` action (via `bulk_order_endpoints()`). That means every REST controller's `get_instance()` — and therefore its constructor — already runs *during* `rest_api_init`.

**Correct pattern already used everywhere in this codebase** — register routes straight in the constructor via `init_hooks()`:

```php
protected function __construct() {
    $this->init_hooks(); // calls register_rest_route() directly, no re-hooking
}
```

**Bug pattern to avoid** — wrapping registration in another `add_action('rest_api_init', ...)`:

```php
protected function __construct() {
    add_action( 'rest_api_init', [ $this, 'register_routes' ] ); // BUG
}
```

This adds a priority-10 callback to a priority-10 bucket that `WP_Hook` has already consumed in the current pass — it silently never fires. Result: `register_rest_route()` never runs, the route doesn't exist, and hitting the URL returns a plain 404 with no error logged anywhere. This exact bug hit `POGatewayRestController.php` in the sister plugin YayWholesale B2B (fixed 2026-09-22) — worth remembering here since the architecture is identical.

Rule of thumb: if a singleton's `get_instance()` is called from *inside* a hook callback, don't re-hook the same action inside its constructor. Only hook an action from a constructor when that constructor runs *before* the action fires (e.g. the two `*Engines\RestAPI` classes themselves, called from `plugins_loaded`).

---

## Adding a new class checklist

1. Pick the layer: `Engines/*` (hooks into WP, stateful), `Controllers/*` (REST only, extends `BaseRestController`), or `Services/*` (business logic, no WP hooks — called by Engines/Controllers).
2. `use SingletonTrait;` and add a `get_instance()` call to the right bootstrap:
   - Lite engine → [YayBulkOrder.php](../../includes/YayBulkOrder.php)
   - Pro engine → [YayBulkOrderPro.php](../../includes/Pro/YayBulkOrderPro.php)
   - Core REST controller → [Engines/RestAPI.php](../../includes/Engines/RestAPI.php) `bulk_order_endpoints()`
   - Pro REST controller → [Pro/Engines/RestAPI.php](../../includes/Pro/Engines/RestAPI.php) `bulk_order_endpoints()`
3. Check what hook the *caller* runs on, and only hook that same action again in your constructor if your class is instantiated *before* that action fires. See "Hook timing" above.
4. REST controllers: extend `BaseRestController`, use `self::REST_NAMESPACE` (`yay-bulk-order/v1`), use `exec_read`/`exec_write` wrappers for try/catch + response shaping + DB transaction (write only).
5. Register routes in a `protected function init_hooks()` called from the constructor, mirroring existing controllers — do not add a `register_routes` method hooked separately.

---

## Known inconsistencies (verified against the current code — flag before relying on them)

- `Pro\YayBulkOrderPro::register_admin_menu()` currently instantiates `YayBulkOrderLicenseAdapter` (the **Lite** adapter), not `YayBulkOrderProLicenseAdapter`, even in a Pro build — the Pro adapter line is commented out. The menu title/slug happen to be identical between both adapters today, so this is not visibly broken, but it means Pro-specific menu config (e.g. `get_pro_url()`) never takes effect. Confirm with the team before assuming the Pro adapter is live.
- Licensing is not enforced: `YayBulkOrderPro`'s constructor has the `is_licensed()` gate commented out with `// TODO: EDD setup`. Any site with `includes/Pro/` present gets full Pro features regardless of license state.
- Three different option/meta key prefixes coexist: `yaybulkorder_*` (e.g. `yaybulkorder_reviewed`), `yay_bulk_order_*` (e.g. `yaybulkorder_settings`), and `ybod_*` (e.g. `yaybulkorder_product_table_config`, `yaybulkorder_flushed_rewrite`). None is canonical — match whichever an existing feature already uses rather than picking a "correct" one.
- `patterns/simple.php` and `patterns/filterable.php` exist on disk but are **not** registered anywhere — the two `register_block_pattern` calls that would use them are commented out in [PatternRegistry.php](../../includes/Engines/Blocks/Patterns/PatternRegistry.php). Likely dead/future work; don't assume they're reachable.
- **`apps/packages/block-checkout-slotfill` was never built by any command (fixed 2026-09-22).** It has its own `build` script (`wp-scripts build`), but it isn't listed as a dependency of `app-admin`, `blocks`, or `blocks-pro`, so pnpm's `...`-suffixed filter on the other build scripts never pulled it in, and `release.sh` never called it directly. Confirmed by testing before the fix: `assets/dist/block-checkout-slotfill/` did not exist in a fresh checkout, so `Pro\Engines\Frontend\Frontend::enqueue_slotfill()` was silently no-op'ing (`if ( ! file_exists( $asset_path ) ) { return; }`) — the Pro "Save as Purchase List" checkout slot-fill had likely never shipped in any built release. **Fix**: added a `build:checkout-slotfill` script to root `package.json`, and `release.sh` now runs it in the Pro branch alongside `build:pro`. The `.claude/hooks/check-checkout-slotfill-build.sh` Stop hook also covers it for interactive dev sessions. Verified: running `pnpm run build:checkout-slotfill` produces `assets/dist/block-checkout-slotfill/{block-checkout-slotfill.js,block-checkout-slotfill.asset.php}`.
