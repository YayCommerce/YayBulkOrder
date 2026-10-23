# Plan: Store API error handling (WC quantity filter + 429)

## Goal

Show shoppers why an add-to-cart failed (quantity-rule rejections, rate limits), and re-test cart data with the new Store API.

## Approach

- Shared client (`apps/packages/common/src/storeApi/index.ts`):
  - Add `StoreApiError` with `status`, `code`, `message` from the WP_Error body.
  - HTTP 429 → friendly "Too many requests, please wait and try again" message (use `Retry-After` if sent).
  - Batch: collect each failed sub-response message (400 from `woocommerce_store_api_cart_item_quantity_validation`, 429, others) instead of only `console.error`.
  - Return `{ cart, errors }` so partial success still syncs the cart and reports failed items.
- State: add `cartError: { visible, messages[] }` to `tableState` in Product Table (Lite) and Variant Table (Pro). Clear on next add or select change.
- UI: error notice next to the "View cart" notice in `apps/blocks/src/product-table/table-bulk-action/render.php` and `apps/blocks-pro/src/variant-table/table-footer/render.php`. `data-wp-text` messages, `role="alert"`, style matches existing notice.
- No auto-retry on 429.
- Re-test cart item data: code does not read `extensions` / `item_data` / `raw_key`. Confirm with `/wcheck`: variations ("Any" attributes), quantity badges, mini-cart sync, Purchase List / CSV add on WC 10.7+.

## Checkpoints

1. Error handling + notice + re-test — test filter returning `WP_Error` shows its message in both tables (single + bulk); mixed batch adds valid items and lists rejected ones; forced 429 shows friendly message; `/wcheck` regression pass.

## Out of Scope

- 429 auto-retry/backoff.
- CSV Order and Purchase List add-to-cart (classic `WC()->cart->add_to_cart()` via AJAX; new filter does not apply).
- Own quantity rules.
- `WC tested up to` bump (needs target version).

## Meta

- Target branch: jack/setup/claude
- Base branch: develop
