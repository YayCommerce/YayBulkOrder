---
description: WordPress.org pre-submission review — build the Lite zip, run Plugin Check on it, and check it against the release checklist. Reports only; does not fix.
---

# /wpreview

Review the **Lite release zip** against `.claude/docs/context-wporg-release-checklist.md`. Report only. Do not change code.

## Steps

1. **Read the checklist** in full. It is the source of truth.
2. **Build and extract** into the session scratchpad:
   ```bash
   PATH="/opt/homebrew/opt/php@8.3/bin:$PATH" pnpm release:lite > <scratchpad>/release-lite.log 2>&1; echo "exit: $?"
   rm -rf <scratchpad>/lite && mkdir -p <scratchpad>/lite && unzip -q release/yay-bulk-order.zip -d <scratchpad>/lite
   ```
   If the build fails, stop and show the end of the log.
3. **Run each item's How** in `<scratchpad>/lite/yay-bulk-order`, not the dev folder. Read the code behind every grep hit before you call it a finding.
4. **Run Plugin Check (T1)** on the zip build. The WordPress root is 3 folders above the plugin (`../../..`).
   1. Check that it is installed: `wp plugin is-installed plugin-check 2>/dev/null; echo $?`. If not (`1`), ask the user once, then `wp plugin install plugin-check --activate`.
   2. If `wp-content/plugins/yay-bulk-order` already exists, stop and ask. It can be a real install.
   3. Copy the build in, check it, then remove the copy:
      ```bash
      cp -R <scratchpad>/lite/yay-bulk-order <wp-root>/wp-content/plugins/yay-bulk-order
      wp plugin check yay-bulk-order --format=json --include-experimental 2>/dev/null | grep -v '^Deprecated:' > <scratchpad>/plugin-check.json
      rm -rf <wp-root>/wp-content/plugins/yay-bulk-order
      ```
      The folder must be `yay-bulk-order`, so the text domain matches the slug. Do not activate the copy: the dev plugin defines the same functions.
   4. Group the results by `code`. ERRORs are Must fix. WARNINGs are Should fix. Read the code behind each one, like a grep hit.
5. **Report.** Start with **Ready** or **Not ready (N blockers)**, then:
   - **Must fix:** ID, file:line, problem, fix.
   - **Should fix:** ID and why.
   - **Passed:** IDs, one line per section.
   - **Not checked:** IDs and why.

   Then ask which items to fix.

## Project specifics

- **G1:** `vendor-prefixed/src/License/` must not exist in the zip.
- **G1, B4:** no Pro files: `includes/Pro`, `assets/pro`, `assets/dist/{blocks-pro,variant-table-store,purchase-list-store,block-checkout-slotfill}`.
- **B1:** every GitHub link in the readme must return HTTP 200 (`curl -s -o /dev/null -w '%{http_code}' <url>`). A 404 means the repo is private, which is a blocker. Then compare the default branch with the code you review: `gh api repos/YayCommerce/YayBulkOrder/compare/main...<branch>`. If `main` is behind, report it. The repo also holds Pro code (`includes/Pro`, `apps/blocks-pro`), so report it if that is still public.
- **Q2:** PHP names (options, meta, transients, post types, shortcodes, hooks) use `yaybulkorder`. `ybo` is OK only for template variables (`$ybod_*`, local to the function that includes the template), HTML attributes, JS strings and CSS (`ybod-*` classes, `--ybod-*` variables, the `ybod_csv_order` form fields, `ybod_*` AJAX actions). The Pro `ybod_*` hooks are not in the Lite zip. `ywhs` and `woocommerce` names belong to other plugins: they are not findings, but the reply must explain them (U3).
- **Q10:** the check must be in both `yay-bulk-order.php` and `assets/pro/yay-bulk-order-pro.php`.
- **Q11:** needs a clean site. Do not activate the copy in step 4. Without a clean site, report "not checked".
- **Q12:** check that `YAYBULKORDER_MAX_VARIATION_IN_ROW` and `YAYBULKORDER_MAX_PRODUCTS` limits are applied, and that `get_variation_price( 'min' )` is used when no `yaybulkorder_adjust_raw_price` handler is hooked.
- **T1:** see step 4. Report each Plugin Check finding as `T1 <code>`, with file:line.
- **T2:** run PHPCS only if `vendor/bin/phpcs` exists. Otherwise report "not run". Do not install it without asking.

## Gotchas

- WP-CLI prints `Deprecated:` warnings to stdout. Add `2>/dev/null`, and never capture its output into a path variable.
- Findings in `vendor-prefixed/` belong to the shared `yaycommerce/admin-shell` package. Say the fix goes there.
- `release/` may hold old extracted folders. Check only the fresh zip.
