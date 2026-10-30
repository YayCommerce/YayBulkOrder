---
description: WordPress.org pre-submission review — build the Lite zip and check it against the release checklist. Reports only; does not fix.
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
4. **Report.** Start with **Ready** or **Not ready (N blockers)**, then:
   - **Must fix:** ID, file:line, problem, fix.
   - **Should fix:** ID and why.
   - **Passed:** IDs, one line per section.
   - **Not checked:** IDs and why.

   Then ask which items to fix.

## Project specifics

- **G1:** `vendor-prefixed/src/License/` must not exist in the zip.
- **G1, B4:** no Pro files: `includes/Pro`, `assets/pro`, `assets/dist/{blocks-pro,variant-table-store,purchase-list-store,block-checkout-slotfill}`.
- **B1:** the readme source link must return HTTP 200 (`curl -s -o /dev/null -w '%{http_code}' <url>`). A 404 means the repo is private, which is a blocker.
- **T1, T2:** run Plugin Check or PHPCS only if already installed. Otherwise report "not run". Do not install anything without asking.

## Gotchas

- WP-CLI prints `Deprecated:` warnings to stdout. Add `2>/dev/null`, and never capture its output into a path variable.
- Findings in `vendor-prefixed/` belong to the shared `yaycommerce/admin-shell` package. Say the fix goes there.
- `release/` may hold old extracted folders. Check only the fresh zip.
