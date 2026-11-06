---
tags: [context, reference, backend, frontend]
triggers: [data model, model relationship, schema, options, meta data in order, post, taxonomy, products, purchase list, product table]
---

# Model List

Bottom line: no custom DB tables. Every entity lives in WP core tables (posts, postmeta, options, transients) or WooCommerce's own data. **Three different key-prefix conventions coexist** (`yaybulkorder_*`, `yay_bulk_order_*`, `ybod_*`) — see the note in `context-project-structure.md`.

---

## Core entities

| Model | Storage | PHP / Helper | TS Schema |
|-------|---------|--------------|-----------|
| Product Table | CPT `yaybulkorder_table` (non-public, `manage_woocommerce`) | [ProductTablesService.php](../../includes/Services/ProductTablesService.php) | [product-tables.schema.ts](../../apps/packages/common/src/schemas/product-tables.schema.ts) |
| Plugin Settings | option `yaybulkorder_settings` | [SettingsService.php](../../includes/Services/SettingsService.php) | [settings.schema.ts](../../apps/packages/common/src/schemas/settings.schema.ts) |
| Purchase List (Pro) | CPT `yaybulkorder_plist` | [PurchaseListService.php](../../includes/Pro/Services/PurchaseListService.php) | — |

---

## Product Table — shape and meta

Constants defined on `ProductTablesService`:

| Key | Scope | Purpose |
|---|---|---|
| `yaybulkorder_product_table_config` (`TABLE_CONFIG_META`) | post meta | Full table config JSON: `{ query: { queryBy, categories, products }, columns: [], features: { hasFilter, hasSearch, hasPagination, pageSize } }` |
| `yaybulkorder_product_table_products` (`PRODUCT_TABLE_DISPLAY_META`) | post meta | Denormalized `query.queryBy` value (`all-products` / `by-category` / `featured` / `on-sale` / `hand-picked`), used to filter the admin list by display type without decoding the full config each time |
| `yaybulkorder_shop_page_product_table` (`SHOP_PAGE_PRODUCT_TABLE_META`) | **option** (despite the "META" name) | ID of the table currently applied to the shop archive page |
| `yaybulkorder_new_page_blocks_{user_id}` (`STASHED_NEW_PAGE_CONTENT_TRANSIENT` prefix) | transient, 5 min | Block markup stashed when a table is "applied to a new page", consumed by `Engines\Admin\ProductTable::replace_the_stashed_to_the_content()` on the next `auto-draft` Page created by that same user |

`QUERY_BY_OPTIONS = ['all-products', 'by-category', 'featured', 'on-sale', 'hand-picked']`, `RESPONSIVE_OPTIONS = ['always-show', 'hide-on-mobile', 'hide-on-tablet']` (column responsive behavior).

Post type `yaybulkorder_table` is `show_in_rest => true` with `rest_base => table-prebuilds`, but the plugin's own REST controllers (not WP's default CPT REST controller) are what the admin SPA actually talks to.

---

## Purchase List (Pro) — shape and meta

| Key | Scope | Purpose |
|---|---|---|
| `yaybulkorder_purchase_list_data` (`PURCHASE_LIST_META_DATA`) | post meta on `yaybulkorder_plist` | Serialized list items (products + quantities) |

`PURCHASE_LIST_PER_PAGE = 10` (pagination default).

---

## Settings shape

`SettingsService::get_default_settings()`:

```
general:      { defaultCartQuantity, defaultPageSize }
colors:       { primary, text, textHover, description, border, background,
                buttonBackground, buttonBackgroundHover, buttonText, buttonTextHover,
                headerBackground, headerText }
purchaseList: { isAddToAccountPage, savePurchaseListButton: { isAddToCartPage, isAddToCheckoutPage, isAddToMiniCart, isAddToOrder } }
csvOrder:     { isAddToAccountPage }
borderRadius: string (CSS value, e.g. '8px')
```

Stored merged with defaults via `array_replace_recursive` on both read and write — a partial `save_settings()` payload never wipes out unrelated keys.

---

## Options (plugin-wide, not per-post)

| Option key | Purpose |
|---|---|
| `yaybulkorder_settings` | Main settings blob — see above |
| `yaybulkorder_shop_page_product_table` | Table ID applied to the shop page |
| `yaybulkorder_flushed_rewrite` | One-time flag so Pro's `PurchaseList`/`CSVOrder` engines only call `flush_rewrite_rules()` once after their CPT/endpoints register; cleared on deactivate |
| `yaybulkorder_reviewed` | Review-nudge dismissed flag |
| `yay-bulk-order-pro_license_key`, `..._license_info` | License data — stored but not currently read by any enforcement code, see `context-plugin-list.md` |

## Transients

| Key | TTL | Purpose |
|---|---|---|
| `yaybulkorder_new_page_blocks_{user_id}` | 5 min | See Product Table section above |
| `yaybulkorder_csv_order_recent_logs` (`CSVOrderService::CSV_ORDER_RECENT_LOG`) | 10 min | Last CSV-order import result (success count + failure messages), read back by the admin notice after redirect |

---

## REST controllers (resource map)

| Controller | Resource |
|---|---|
| [ProductTablesRestController](../../includes/Controllers/ProductTablesRestController.php) | CRUD + bulk-delete + stash + apply-to-shop for Product Tables |
| [ProductQueryRestController](../../includes/Controllers/ProductQueryRestController.php) | Category list, product search (table builder pickers) |
| [SettingsRestController](../../includes/Controllers/SettingsRestController.php) | Get/update settings, mark-reviewed |
| [Pro\Controllers\PurchaseListRestController](../../includes/Pro/Controllers/PurchaseListRestController.php) | Create/update/delete/download-CSV for Purchase Lists |

---

## Relationships

```
Product Table (CPT yaybulkorder_table)
  ├─ has one → shop-page assignment (option yaybulkorder_shop_page_product_table, 0-or-1 table)
  └─ rendered by → [yaybulkorder-product-table] shortcode, Product Table block, or shop-loop replacement (StorePage.php)

Purchase List (CPT yaybulkorder_plist, Pro)
  ├─ belongs to → User (post_author, created from cart/order/manual save)
  └─ reloaded into → WC Cart (ajax: ybod_add_purchase_list_to_cart)

Settings (option yaybulkorder_settings)
  └─ read by → SettingsService::get_config()/get_styles(), consumed by both the admin SPA (REST) and storefront blocks (localized data via LocalizeService)
```
