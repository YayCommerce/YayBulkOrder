# Plan: Setup e2e (Playwright + @wordpress/env) at tests/e2e — Product Table smoke spec

## Goal
Stand up a real, runnable e2e harness at `tests/e2e` (Playwright + `@wordpress/env`), with one smoke spec that verifies the actual Product Table **block** (not the `[ybo-product-table]` shortcode) renders products and completes a real add-to-cart against WooCommerce. Then rewrite `.claude/skills/we2e/SKILL.md` to describe the real, working setup instead of the current "unwired stub" description.

## Approach
- New workspace package `tests/e2e` (`@yay-bulk-order/tests-e2e`), TypeScript, `@playwright/test` + `@wordpress/env`. `pnpm-workspace.yaml` already points here (uncommitted change, kept as-is).
- Single `.wp-env.json` (single-site only for this phase — no multisite/compat variants yet): maps the local plugin (`../..`) + WooCommerce zip, PHP 8.2, dedicated port `8890` to avoid clashing with other `wp-env` instances on this machine.
- Seed via `wp-env run cli` in an `afterStart` lifecycle script:
  - 3 simple, published WooCommerce products with prices.
  - 1 Page whose `post_content` is the **actual registered pattern content** for `yay-bulk-order/simple-product-table` (read from `WP_Block_Patterns_Registry`, not a hand-copied markup string) — guarantees it's the real Product Table block, identical to what a user gets by inserting it from the block editor.
  - Disable WooCommerce coming-soon/onboarding, set a sane permalink structure.
- Spec `tests/e2e/tests/product-table.spec.ts`:
  1. Visit the seeded page — assert the table renders the expected columns and product rows.
  2. Set a quantity, select a row, trigger add-to-cart — assert the WooCommerce cart actually updates (mini-cart / cart count reflects the added item and quantity).
- Root `package.json` scripts: `test:e2e:install`, `test:e2e:env:start`, `test:e2e:env:stop`, `test:e2e` (all delegate via `pnpm --filter @yay-bulk-order/tests-e2e`).
- `.gitignore`: add `test-results/`, `playwright-report/`, `.state/` under `tests/e2e/`.

## Checkpoints
1. **Harness runs green** — `pnpm test:e2e:install` → `pnpm test:e2e:env:start` (needs Docker running) → `pnpm test:e2e` passes both assertions in `product-table.spec.ts`. Verify visually via the Playwright HTML report.
2. **Rewrite `/we2e`** — update `.claude/skills/we2e/SKILL.md` to match the real setup (spec-selection, install/start/run/report steps), explicitly flagging thin coverage (one spec, no multisite/compat yet) so a future session doesn't assume more exists than it does. Also fix the stale `/we2e` description in `.claude/CLAUDE.md` and the "E2E status" section in `.claude/docs/context-dev-convention.md` to match.

## Out of Scope
- Multisite and sister-plugin compatibility suites (YayWholesale/YayCurrency/YayExtra/YayPricing).
- Purchase List, CSV Order, merchant REST specs.
- CI workflow (`.github/workflows`).
- The `origin/jack/e2e-test` branch and its existing (unmerged) e2e work — explicitly ignored per user decision; not reused, not referenced.

## Meta
- Target branch: `origin/jack/setup/claude` (current branch; not `develop`/`main`, so no new branch created)
- Base branch: develop
