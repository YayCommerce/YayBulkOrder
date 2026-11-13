---
description: Pre-ship browser verification — run through a structured checklist in Chrome before calling any frontend task done.
---

# /wcheck

Workflow - Browser verification. Run this before marking any frontend task done. This is the primary verification method in this repo — there is no working e2e suite (see `/we2e`) and no unit test runner.

---

## Step 0 — Browser Extension

Ask the user:
1. Is the **Claude in Chrome** (or Firefox) extension installed and enabled for this site?
2. What is the **site URL**? (e.g. `http://localhost:8888`)
3. What is the **testing page URL**? (e.g. `/wp-admin/admin.php?page=yay_bulk_order#/product-tables`, or a storefront page containing the Product Table / Variant Table block, or a page with the `[yaybulkorder-product-table]` shortcode)

Do not proceed until you have both URLs confirmed.

---

## Step 1 — Take a screenshot

Capture the current state of the feature in Chrome. Identify what view/state to verify based on the task.

---

## Step 2 — Check the console

Use `read_console_messages` with `onlyErrors: true`. If any errors are present:

1. Identify the source (line, file, message)
2. Fix the error before continuing
3. Re-verify

---

## Step 3 — Test the golden path

For each primary user action the task introduced or changed:

- Perform the action
- Screenshot the result
- Confirm the expected outcome is visible

---

## Step 4 — Test navigation / state persistence

For any feature that builds display state client-side after navigation (table builder steps, pagination, filters, the product-table interactivity store):

- Navigate away (next step/page/tab)
- Navigate back
- Confirm all dynamic display values are still correct (selection state, counts, applied filters, etc.)

> **Why**: PHP bakes some display state at render time (e.g. the shop-page table assignment). JS rebuilds interactivity-store state on navigation. Values not passed to every rebuild call silently disappear.

---

## Step 5 — Test edge cases for this task

List any edge cases relevant to the task (e.g. "no products match the query", "variable product with all-Any attributes", "empty CSV upload", "table applied to shop page while a category filter is active"). Test each one.

---

## Step 6 — Report

Present a brief table:

| Check | Result |
|---|---|
| Console errors | None / [list] |
| Golden path | Pass / Fail |
| Navigation persistence | Pass / Fail |
| Edge cases | Pass / Fail |

If anything failed, fix it and re-run the failed checks before reporting done.
