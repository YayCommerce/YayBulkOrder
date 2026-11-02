---
tags: [workflow, convention]
triggers: [branch naming, dev workflow, format, lint, prettier, eslint, checkpoint, /wplan, /wdev, plan, skill, lifecycle, verify, verification]
---

# Dev Convention

Quick reference: workflow skills, branch naming, formatting, verification.

---

## Workflow

| Skill | Does |
|-------|------|
| `/wplan` | Gathers requirements, researches, writes & commits plan. No code. |
| `/wdev` | Runs `/wplan` if no plan. Develops checkpoints interactively, with format+typecheck before each review. |
| `/wplan-done` | After checkpoints are done and merged — deletes the plan file. |

---

## Branch Naming

**Default: current branch.** New branch only if the user asks, or the current branch is `develop`/`main` (never commit directly to those).

Prefixes: `feature/...`, `fix/...`, `research/...`, `release/...`. Branch off `develop`. Lowercase, hyphen-separated.

Plan files: `.claude/plans/<slug>.md`.

**Always set upstream on first push: `git push -u origin <branch-name>`.** A branch created off `develop` inherits `develop`'s tracking config until its own upstream is set — `git branch -vv` will show it as `[origin/develop: ...]`. A bare `git push` in that state pushes straight to `origin/develop`. Check `git branch -vv` before the first push on any new branch.

---

## Format Before Commit

Per touched package:

```bash
# apps/app-admin (Vite/eslint/prettier stack)
pnpm --filter @yay-bulk-order/app-admin lint:fix

# apps/blocks, apps/blocks-pro, apps/packages/* (wp-scripts stack — no lint:fix script)
pnpm --filter <package-name> lint:js
pnpm --filter <package-name> lint:css
pnpm --filter <package-name> format
```

`lint:fix` (app-admin only) runs eslint --fix then prettier --write. The `wp-scripts`-based packages (`blocks`, `blocks-pro`, and everything under `apps/packages/*`) don't have a combined autofix script — run `format` (prettier via wp-scripts) then re-check `lint:js`/`lint:css` manually for anything left.

PHP is linted with PHPCS via root `phpcs.xml` (WordPress-Extra + PHPCompatibilityWP, PHP 7.4+). `phpcs`/`phpcbf` are **not** project-local (not in `composer.json` require-dev, not in `vendor/bin`) — install globally and run:

```bash
composer global require squizlabs/php_codesniffer wp-coding-standards/wpcs phpcompatibility/phpcompatibility-wp
phpcs --standard=phpcs.xml <path>     # check
phpcbf --standard=phpcs.xml <path>    # auto-fix
```

---

## Adding a JS Block

A new block under `apps/blocks/src/*` or `apps/blocks-pro/src/*` needs a build step before it appears in WP — raw source is never loaded directly. Follow the existing pattern in e.g. `apps/blocks/src/product-table/column-add-to-cart/`: a `block.json`, an `edit.tsx`/`index.tsx` for the editor, and (for dynamic/interactive blocks) a PHP render callback or `@wordpress/interactivity` store hookup via the relevant `apps/packages/*-store` package.

Run the owning package's `dev`/`build` script (see "Dev Servers" below) after adding/editing, then verify with `/wcheck` — an unbuilt block will not appear in WP.

Before shipping, check that WP block APIs used aren't deprecated (current `@wordpress/*` package APIs, current `block.json` schema version) — WordPress deprecates block APIs across major versions and stale patterns break silently or trigger console warnings.

**Write JSX, not `createElement`.** Use HTML tags directly (`<div className="...">`) instead of nested `createElement( 'div', {...} )` calls.

**Avoid `useEffect`.** Prefer event handlers and derived values computed during render. Reach for `useEffect` only as a last resort — most state updates don't need it.

---

## Dev Servers

```bash
# Admin SPA (apps/app-admin) — Vite dev server on :3000, HMR
pnpm dev:admin:lite    # or dev:admin:pro
# Requires wp-config.php: define( 'YAYBULKORDER_IS_DEVELOPMENT', true );
# otherwise RegisterProd (built assets) is used instead of RegisterDev (localhost:3000 module).

# Lite Gutenberg blocks (apps/blocks) — wp-scripts start, watches product-table + common
pnpm dev

# Pro Gutenberg blocks (apps/blocks-pro) — wp-scripts start
pnpm dev:pro
```

Block dev servers (`wp-scripts start`) write directly into `assets/dist/blocks*` on save — no separate "build" step needed while developing, just reload the WP page/editor. The admin SPA dev server needs the `YAYBULKORDER_IS_DEVELOPMENT` constant above; without it, WordPress loads the last **built** admin bundle even while `pnpm dev:admin` is running.

---

## Stop hook: automatic build check

`.claude/settings.json` runs four scripts from `.claude/hooks/` whenever Claude finishes a turn: `check-admin-build.sh`, `check-blocks-build.sh`, `check-blocks-pro-build.sh`, `check-checkout-slotfill-build.sh`. Each one checks `git status` against the specific paths it cares about (its own package plus the shared packages it depends on) and does nothing if none changed — otherwise it runs that package's real build and, on failure, blocks Claude from finishing with the build error attached. This means a broken TS/JS build in `apps/app-admin`, `apps/blocks`, `apps/blocks-pro`, or `apps/packages/block-checkout-slotfill` can't be silently left behind at the end of a turn.

This does **not** replace `/wcheck` — a clean build only means the code compiles, not that the feature behaves correctly in the browser. It also doesn't cover pure-PHP changes (no PHP build step exists) or the admin SPA's Pro build variant (only `build:admin:lite` runs, as the cheaper representative check — see the scripts for the exact path-to-build mapping if you need to add a new bucket).

---

## Verify Before Review

`apps/app-admin` has no standalone typecheck script — `tsc --noEmit` runs as part of `build:lite`/`build:pro`:

```bash
pnpm --filter @yay-bulk-order/app-admin build:lite   # or build:pro
```

There is no unit test runner (no vitest/jest) configured anywhere in this repo. Rely on `/wcheck` for behavior verification. If you add meaningful new logic, flag to the user that there's no unit test harness yet rather than silently skipping verification.

---

## E2E status: wired up, coverage is thin

`tests/e2e` (package `@yay-bulk-order/tests-e2e`) is a real Playwright + `@wordpress/env` suite — not the stub it used to be. `/we2e` runs it. Root scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:env:start`, `test:e2e:env:stop`, `test:e2e:install`.

- **Requires Docker running.** `wp-env` spins up WordPress + WooCommerce in containers on port `8890`.
- **Two spec files exist today**: `tests/e2e/tests/product-table.spec.ts` (render + add-to-cart for the Product Table block) and `tests/e2e/tests/settings.admin.spec.ts` (General tab number field; all 12 Design tab colors across their 3 sub-tabs, save/persist round-trips). The Advanced settings tab, Purchase List, CSV Order, Variant Table, and everything Pro have no coverage yet.
- **Guest vs admin sessions**: three Playwright projects — `setup` (logs into wp-admin once), `guest` (storefront specs), `admin` (wp-admin specs, depends on `setup`). A spec named `<feature>.admin.spec.ts` gets an authenticated session automatically; anything else runs as a guest.
- **wp-env serves whatever is currently built, not current source.** `assets/dist/page-admin` (and `assets/dist/blocks*`) are live-mounted into the container as-is — there's no build step in `wp-env start`. This already caused a real false negative: a stale admin SPA build silently hid DesignTab's newer fields (no error, they just weren't in the DOM), and a spec that didn't touch them would have passed anyway while testing old UI. Run `pnpm build:admin:lite` (or `:pro`, or `pnpm build`/`build:pro` for blocks) before trusting a `/we2e` result if the relevant source changed since the last build.
- **No CI** — `.github/workflows` doesn't exist in this repo. This suite is local-only until that's added.
- **Local browser quirk**: `playwright.config.ts` drives system-installed Google Chrome (`channel: 'chrome'`) instead of Playwright's bundled Chromium on non-CI runs — hit and fixed once already, when Playwright dropped bundled-browser support for the dev machine's macOS version. `pnpm test:e2e:install` (downloads bundled Chromium) is for a future CI workflow, not local runs.
- Fixtures are seeded automatically on `wp-env start` via `tests/e2e/bin/seed.sh` (idempotent — skips if already seeded).

See `/we2e` for the full run/add-a-spec recipe.

---

## Checkpoint Verification

Pick the cheapest method. See `context-page-map.md` for URLs/routes.

| Change type | Method |
|-------------|--------|
| PHP-only | Reload page in browser |
| PHP warnings | `curl -sk https://<dev-url>/ \| grep -i warning` |
| WP internals (CPT, options, meta) | `wp eval` via your local WP CLI |
| REST / backend data | `fetch('/wp-json/yay-bulk-order/v1/...')` in browser console with `X-WP-Nonce: wpApiSettings.nonce` |
| React/TS (admin SPA) | `pnpm dev:admin:lite` (or `:pro`), then `/wcheck` |
| Gutenberg block change | `pnpm dev` (or `dev:pro`), then `/wcheck` in the block editor and on the front end |
| Change with an existing e2e spec (see `/we2e`) | `/we2e` — regression-check the real add/update against a running spec before `/wcheck` |

**Order of preference:** REST fetch > wp eval > page reload > `/we2e` (if a spec already covers the change) > `/wcheck`.

---

## Skill File Conventions

When editing any `.claude/skills/*/SKILL.md`:

- **General, not session-specific.** No references to the current task, PR, or specific code paths.
- **Concise.** Rules over examples. Cut any line that doesn't change behavior in a future session.
- **Principles over recipes.** Name the category of situation, not a specific instance of it.
