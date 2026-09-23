---
description: Run YayBulkOrder e2e tests (Playwright + @wordpress/env). Coverage is thin today (Product Table, Settings General + Design) — auto-selects spec files from git diff, or accepts an explicit path.
---

# /we2e

Run YayBulkOrder end-to-end tests. Stack: Playwright + `@wordpress/env`, config in `tests/e2e/`.

**Requires Docker running** (wp-env runs WordPress + WooCommerce in containers, port `8890`).

There is no `@tag` grep system in this suite — filtering is by spec file path / Playwright project.

Three Playwright projects (see `playwright.config.ts`): `setup` (logs in once, `fixtures/auth.setup.ts`), `guest` (storefront specs, no login), `admin` (wp-admin specs, depends on `setup`, reuses its session). A spec lands in `admin` purely by filename: name it `<feature>.admin.spec.ts` and it's routed there automatically — no config change needed.

---

## Step 1 — Determine which spec(s) to run

If the user passed an explicit spec path or `all`, use that.

Otherwise:
```bash
git diff --name-only develop...HEAD
```

Map changed paths to spec files under `tests/e2e/tests/`:

| Changed path pattern | Spec(s) |
|---|---|
| `apps/blocks/src/product-table/**`, `apps/packages/product-table-store`, `patterns/product-table__*.php`, `includes/Engines/Blocks/Patterns/PatternRegistry.php`, `includes/Services/ProductQueryService.php` | `tests/product-table.spec.ts` |
| `apps/app-admin/src/pages/settings/**`, `apps/app-admin/src/components/ui/color-picker.tsx`, `includes/Services/SettingsService.php`, `includes/Controllers/SettingsRestController.php` | `tests/settings.admin.spec.ts` (both General and Design describe blocks) |
| Anything else / broad changes | run everything anyway — coverage is currently thin (two spec files), so "all" is cheap |

Report the selected spec(s) and why before running.

---

## Step 2 — Browser note (first run, or on an unfamiliar machine)

`playwright.config.ts` uses the system-installed Google Chrome (`channel: 'chrome'`) for local runs instead of Playwright's bundled Chromium — newer bundled Chromium/ffmpeg builds have dropped support for older macOS versions (e.g. Monterey), and this repo hit that exact failure once already. This means:
- Local runs need Google Chrome installed on the machine, **not** `pnpm test:e2e:install`.
- `pnpm test:e2e:install` (downloads Playwright's own Chromium) is for CI only, once a CI workflow exists (none does yet — see Notes).

If a local run fails with a "does not support ... on macXX" error, that confirms this is still relevant; don't "fix" it by trying to force the bundled browser.

---

## Step 3 — Rebuild before trusting an admin SPA (`*.admin.spec.ts`) result

The wp-env container mounts this checkout live and serves whatever is currently sitting in `assets/dist/page-admin` — it does **not** rebuild on its own. This bit the suite once already: a stale build (missing DesignTab's Header Background/Header Text fields and its 3-sub-tab structure entirely) made `settings.admin.spec.ts` test against old UI without any error, since the fields it didn't touch just silently weren't there. If `apps/app-admin` has changed since the last build (or you're not sure), rebuild first:

```bash
pnpm build:admin:lite   # or build:admin:pro
```

Product Table / other Gutenberg-block specs have the same risk for `apps/blocks*` — rebuild (`pnpm build`/`pnpm build:pro`) or run the matching `pnpm dev`/`dev:pro` watcher before trusting a result there too.

---

## Step 4 — Start wp-env

```bash
pnpm test:e2e:env:start
```

Idempotent — safe to call even if already running. On a fresh start it also seeds fixtures automatically via `tests/e2e/bin/seed.sh` (the `afterStart` lifecycle script):
- 3 WooCommerce products (SKUs `YBO-E2E-1/2/3`, priced $10/$20/$30). One → category `e2e-cat-a` + tag `e2e-tag-a` + rating 5. Two → category `e2e-cat-b` + tag `e2e-tag-b` + rating 3 (ratings are `_wc_average_rating`/`_wc_review_count` postmeta set directly — no real reviews needed). Three has none of the above.
- A Page (`/e2e-product-table/`) whose content is the real registered `yay-bulk-order/simple-product-table` block pattern.
- A second Page (`/e2e-product-table-duplicate/`) with that *same* pattern inserted twice — for the `queryId`-collision regression spec.

The script skips re-seeding if the first page already exists, so restarting an existing environment won't duplicate fixtures — **if you change what `seed.sh` seeds, destroy and restart the environment** (`pnpm --filter @yay-bulk-order/tests-e2e exec wp-env destroy --force && pnpm test:e2e:env:start`) rather than just restarting it, or the new fixtures won't exist.

---

## Step 5 — Run tests

```bash
# All specs (setup, then guest + admin projects)
pnpm test:e2e

# One spec (still runs the `setup` project first if it's an *.admin.spec.ts)
pnpm --filter @yay-bulk-order/tests-e2e exec playwright test tests/product-table.spec.ts

# One project only
pnpm --filter @yay-bulk-order/tests-e2e exec playwright test --project=guest

# Step through interactively
pnpm test:e2e:ui
```

---

## Step 6 — Report results

| Spec | Result |
|---|---|
| product-table.spec.ts (render, add-to-cart) | Pass / Fail |
| product-table.spec.ts (category / tag / price / rating filters) | Pass / Fail |
| product-table.spec.ts (queryId collision — two tables, one page) | Pass / Fail |
| settings.admin.spec.ts (General) | Pass / Fail |
| settings.admin.spec.ts (Design — Primary Color) | Pass / Fail |
| settings.admin.spec.ts (Design — remaining colors) | Pass / Fail |

If a test fails:
1. Show the failure message (Playwright HTML report: `tests/e2e/playwright-report/`).
2. Investigate root cause (read the relevant block's `render.php` / store file).
3. Fix if it's a test problem; report clearly if it's a real plugin bug.

---

## Adding a new spec

Same recipe as `product-table.spec.ts`/`settings.admin.spec.ts`, whatever the block/feature:
1. Extend `tests/e2e/bin/seed.sh` (or add a sibling seed script) to create fixture data via `wp eval`/`wp post create`/`wp wc product create` — never by hand through the UI.
2. New spec file per block/feature under `tests/e2e/tests/`. Needs a logged-in wp-admin session (Purchase List, admin SPA pages, merchant REST)? Name it `<feature>.admin.spec.ts` — the `admin` project picks it up automatically and it starts already authenticated, no per-test login code needed. Pure storefront/guest flow? Any other name, in the `guest` project.
3. Read the block's own `render.php` (or the React component, for admin SPA pages) for real selectors/classes/`data-wp-key` — don't guess from compiled output. Admin-SPA gotchas already hit, in `utils/color-picker.ts` and `settings.admin.spec.ts`:
   - Broken `label`/`htmlFor` associations (GeneralTab.tsx has one) — fall back to structural locators, e.g. `getByRole('tabpanel').getByRole(...)`.
   - Custom popover-based controls (`ColorPicker`) set `role="combobox"` explicitly, so they won't match `getByRole('button')`. Use `utils/color-picker.ts`'s `setColorField`/`colorFieldTrigger` for any of these rather than re-deriving the pattern.
   - Several field labels are substrings of others ("Text Color" vs "Header Text Color", "Background Color" vs three different "\* Background Color" fields) — a plain `hasText` filter is ambiguous; match the label exactly (`.filter({ has: page.getByText(label, { exact: true }) })`).
   - A closing Popover keeps its content mounted through its exit animation — moving straight to the next field's `getByRole('textbox').first()` can grab the previous (stale) input. Wait for it to actually disappear (`await expect(page.getByRole('textbox')).toHaveCount(0)`) before opening the next one.
4. Resolve dynamic IDs (product IDs, table IDs) via REST at test time (WooCommerce Store API, or the plugin's own `yay-bulk-order/v1` routes) — never hardcode them.
5. Add the new spec to the path-mapping table in Step 1 above.

A Pro-only block (Variant Table, Purchase List, CSV Order) needs `apps/blocks-pro`/`apps/packages/*-store` built into the mapped plugin checkout before its frontend will render in the container — `pnpm build:pro` first.

---

## Notes

- **Slow on first run** — `wp-env start` pulls Docker images, ~2–3 minutes. Subsequent runs are fast.
- **No CI yet** — `.github/workflows` doesn't exist in this repo. This skill is for local verification only.
- **Thin coverage today** — `product-table.spec.ts` (render, add-to-cart, category/tag/price/rating filters — including multi-select and clear-filter cases — and a two-instances-on-one-page regression for the `queryId` collision fix) and `settings.admin.spec.ts` (General tab number field; all 12 Design tab colors across their 3 sub-tabs). Product attribute filters (Color/Size), the Advanced settings tab, Purchase List, CSV Order, and Variant Table have no coverage yet. When a checkpoint adds meaningful new behavior with no matching spec, flag it to the user instead of silently skipping e2e coverage.
- To tear down: `pnpm test:e2e:env:stop`. To fully wipe and start clean next time: `pnpm --filter @yay-bulk-order/tests-e2e exec wp-env destroy --force`.
