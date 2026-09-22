---
description: Bump the plugin version and build lite/pro release zips for staging.
---

# /wdist-staging

Workflow - Bump version and build a distribution for staging.

This repo ships one plugin in two editions (lite/pro) via `release.sh` — see `.claude/docs/context-plugin-list.md`. There is no multi-plugin monorepo here.

---

## Step 1 — Read current version

Read the `Version:` header line from [yay-bulk-order.php](../../../yay-bulk-order.php). Unlike a plain header-only scheme, this plugin also defines the same value as a PHP constant in the **same file**: `define( 'YAYBULKORDER_VERSION', '<version>' );`. Both must change together.

The Pro bootstrap [assets/pro/yay-bulk-order-pro.php](../../../assets/pro/yay-bulk-order-pro.php) duplicates both lines (its own header comment + its own `define()`). Check it matches the Lite file; if it doesn't, ask the user which is correct before proceeding.

So: **4 lines total, across 2 files**, must all end up with the same version string.

---

## Step 2 — Decide next version

Current scheme in this repo is `X.Y.Z.W` (e.g. `0.2.1.5`) — a 4-segment number, not the `X.Y.Z-rcN`/`X.Y.Z-devN` convention used by sister plugins. There is no established pre-release-suffix convention here yet.

| Current version | Next version |
|----------------|--------------|
| `X.Y.Z-rcN` or `X.Y.Z-devN` (if the team has since adopted this) | increment N |
| Plain `X.Y.Z.W` or `X.Y.Z` (current norm) | Ask the user: "Version is `<version>` — bump the last segment, or do you want to switch to `-dev1`/`-rc1` suffix style?" |

Show the user a preview before editing:

> I will bump the version: 0.2.1.5 → 0.2.1.6
>
> Proceed?

Wait for confirmation. Then edit all 4 lines (header + constant, in both files).

---

## Step 3 — Build

Run from the project root. Note the build toolchain requires **PHP 8.3** specifically — `release.sh` hard-fails below it:

```bash
# if the default `php` isn't 8.3:
PATH="/opt/homebrew/opt/php@8.3/bin:$PATH" ./release.sh IS_PRO=false   # lite
PATH="/opt/homebrew/opt/php@8.3/bin:$PATH" ./release.sh IS_PRO=true    # pro
# or, if php already resolves to 8.3:
pnpm release          # both editions
pnpm release:lite
pnpm release:pro
```

This builds the admin SPA + block packages, strips dev-only files per `.distignore`, strips Pro-only code for the lite build, and zips into `release/yay-bulk-order.zip` and/or `release/yay-bulk-order-pro.zip`.

### Step 3.1 — If build fails

- Show the user a concise summary of the error (last 50 lines, key messages).
- Ask: "Auto-fix, or will you fix it manually?"
  - **Auto**: attempt a fix only if simple and clearly scoped (missing import, single-file TS type error). Re-run the build once. If it fails again, stop and ask the user.
  - **Manual**: wait — do not proceed until the user confirms the build is fixed.

---

## Step 4 — Done

> **Staging build complete!**
>
> | Edition | Version | Zip |
> |---|---|---|
> | Lite | 0.2.1.6 | `release/yay-bulk-order.zip` |
> | Pro | 0.2.1.6 | `release/yay-bulk-order-pro.zip` |

## Notes

- Always keep the lite and pro header + constant versions in sync — they ship from the same tag/commit.
- Do not commit the version bump unless the user asks.
- `pnpm install` runs as part of `release.sh` — no need to run it separately first.
- There is no `readme.txt` in this repo yet — nothing else to update on a version bump.
