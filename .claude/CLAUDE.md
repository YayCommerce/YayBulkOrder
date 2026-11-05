# CLAUDE.md

Yay Bulk Order for WooCommerce — lets shoppers add many products (or variations) to cart from one table, plus CSV bulk-order and saved Purchase Lists (Pro).

Single plugin, two editions (Lite/Pro) built from one codebase:

- PHP backend
- React 18 / TypeScript admin SPA
- Gutenberg blocks
- built with Vite 6 + wp-scripts + PNPM.

## Mandatory conventions

- Avoid verbosity. Assume ADHD.
- Use ASD-STE100 Simplified Technical English
- Bottom line up front

## Key Commands

```bash

pnpm dev:admin:lite      # admin SPA dev server (Vite, :3000), needs YAYBULKORDER_IS_DEVELOPMENT=true in wp-config
pnpm dev:admin:pro       # same, Pro mode
pnpm dev                 # lite Gutenberg blocks dev server (wp-scripts start)
pnpm dev:pro             # pro Gutenberg blocks dev server

pnpm build               # build lite blocks
pnpm build:pro           # build pro blocks
pnpm build:admin:lite    # build admin SPA (lite) — includes tsc --noEmit
pnpm build:admin:pro     # build admin SPA (pro)

pnpm release             # build & zip both editions
pnpm release:lite        # lite only
pnpm release:pro         # pro only

pnpm makepot             # regenerate languages/yay-bulk-order.pot
```

## Branches

- Main: `develop`
- PRs target `develop`, not `main`

## Feature Documentation

Before starting any non-trivial task, scan this index. If the task or files match a doc's triggers, **read that doc first** with the Read tool.

| Doc | Tags | Triggers |
| `.claude/docs/context-plugin-list.md` | context, reference | which plugin, list of plugins, all plugins, addon list, bulk-order-pro, free version, pro version, license |
| `.claude/docs/context-model-list.md` | context, reference, backend, frontend | data model, model relationship, schema, options, meta data, post, taxonomy, products, purchase list, product table |
| `.claude/docs/context-dev-convention.md` | workflow, convention | branch naming, dev workflow, format, lint, prettier, eslint, checkpoint, /wplan, /wdev, plan, skill, lifecycle, verify, verification |
| `.claude/docs/context-page-map.md` | context, reference, pages, features | page map, feature map, admin pages, frontend pages, what pages exist, blocks, patterns, shortcode, REST API endpoints, planning |
| `.claude/docs/context-project-structure.md` | context, reference, backend, frontend, workflow | project structure, directory structure, bootstrap, hook order, plugins_loaded, rest_api_init, singleton, register_rest_route, new controller, new engine class |
| `.claude/docs/context-wporg-release-checklist.md` | workflow, release, security | wordpress.org, wp.org review, plugin review, submit plugin, release checklist, plugin check, escaping, nonce, sanitize, readme.txt |

## Skills

| Skill            | When to use                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| `/wplan`         | Plan a non-trivial task before starting                                    |
| `/wdev`          | Develop an agreed plan checkpoint by checkpoint                            |
| `/wcheck`        | Browser verification — run before calling any frontend task done           |
| `/we2e`          | Run e2e tests (Playwright + wp-env) at `tests/e2e` — coverage is thin (Product Table only) |
| `/wplan-done`    | Close out a finished plan                                                  |
| `/wsetup`        | One-time check: verify all dev tools on a new machine                      |
| `/wdist-staging` | Bump the plugin version and build a release zip for staging                |
| `/wpreview`      | Review the Lite zip against the WordPress.org checklist before submitting   |

## UI Components

`apps/app-admin/src/components/ui/` — check here before building new UI.
