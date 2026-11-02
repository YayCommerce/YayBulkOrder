---
description: One-time dev environment check — run after cloning on a new machine to confirm all tools are wired.
---

# /wsetup

One-time setup verification. Not part of the dev loop.

---

## Step 1 — CLI tools

Check each is installed and report the version found (or missing):

```bash
node -v          # requires 24.x (see .nvmrc)
pnpm -v
php -v            # requires 7.4+ at runtime; build toolchain (release.sh) needs exactly 8.3
composer -V
```

Then confirm dependencies install cleanly:
```bash
pnpm install
```

---

## Step 2 — WordPress dev mode constant

Confirm `wp-config.php` on the local WP site has:

```php
define( 'YAYBULKORDER_IS_DEVELOPMENT', true );
```

Without this, `RegisterProd` (built assets) loads instead of `RegisterDev` (Vite dev server at `localhost:3000`) even while `pnpm dev:admin:lite` is running — the admin SPA dev server will appear to do nothing.

---

## Step 3 — PHPCS (optional, only if the dev plans to lint PHP)

`phpcs`/`phpcbf` are not project-local. Install globally:

```bash
composer global require squizlabs/php_codesniffer wp-coding-standards/wpcs phpcompatibility/phpcompatibility-wp
phpcs -i    # confirm WordPress-Extra standard is available
```

---

## Step 4 — Chrome extension

Load browser tools:

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp
```

Call `tabs_context_mcp`. If it returns tab data → extension is live. If it errors → extension is not connected (install or enable it for this site).

---

## Done

Print a single table:

| Tool | Status |
|------|--------|
| node / pnpm | ✓ / ✗ |
| php / composer | ✓ / ✗ |
| YAYBULKORDER_IS_DEVELOPMENT set | ✓ / ✗ |
| phpcs (if planned) | ✓ / ✗ |
| Claude in Chrome | ✓ / ✗ |

One sentence: what's missing and the fix, or "All good — ready to develop."

Note: there is no e2e harness to set up (see `/we2e`) and no unit test runner in this repo today.
