# Plan: Expand Product Table filter sidebar (category multi-select + price + rating + tag)

## Goal
Extend the `table-filter-sidebar` block (Lite + Pro) so shoppers can filter by multiple categories at once, price range, minimum rating, and product tag — using the existing `query-{id}-*` URL param convention — and fix a pre-existing `queryId` collision bug that would otherwise make two same-pattern instances on one page filter each other incorrectly.

## Approach

**`queryId` collision fix (foundation for everything else):**
`yay-bulk-order/product-table-root` declares `providesContext: {"queryId": "queryId"}`, resolved by WordPress from the block's `attrs` *before* `render.php` runs — so `render.php` itself cannot disambiguate `queryId` for descendants after the fact. Fix at the correct point instead: hook WordPress's `render_block_data` filter (registered in `Engines/Blocks/RegisterBlocks.php`, not `ProductQueryService` — Services don't hook WP per this repo's convention) to rewrite `$parsed_block['attrs']['queryId']` for the 2nd+ occurrence of `yay-bulk-order/product-table-root` seen in the current request (a request-scoped counter keyed by the original/baked `queryId`), e.g. `queryId . '-' . $occurrence`. Because this runs before context resolution, every descendant (filter-sidebar, pagination, search) and the block's own `data-wp-router-region` (also currently collision-prone) automatically receive the disambiguated value with no other files needing changes. `BlockHelper`'s param-getter signatures (`get_page_param`, `get_search_param`, `get_category_param`, `build_query_url`) loosen from `int $query_id` to `int|string $query_id` to accept the disambiguated form.

**Category multi-select:**
`BlockHelper::get_category_param` already splits on commas and `ProductQueryService::extend_product_table_query_vars` already passes the full array to `tax_query` (OR semantics) — the single-select limit is UI-only. Rename `query-{id}-category` → `query-{id}-categories` (plural). Change `productTable.store.ts`'s `selectFilterCategory` action from replacing the array to toggling membership. Change `table-filter-sidebar/render.php` from single-select buttons to checkboxes (multi-check), each `.is-active` independently.

**Price range filter:**
New `query-{id}-min-price` / `query-{id}-max-price`. New `ProductQueryService::get_price_bounds()` (actual min/max `_price` across the catalog, to size the slider). **Refactor `meta_query` construction in `extend_product_table_query_vars()` into an array of clauses + `relation => 'AND'`** — it currently gets wholesale-overwritten for the `in-stock` filter, which would silently cancel a simultaneous price filter if not fixed first.

**Rating filter:**
New `query-{id}-rating` (minimum star threshold). One more `meta_query` clause on `_wc_average_rating >=`, using the merged-clause structure from the price checkpoint.

**Product Tag filter:**
New `query-{id}-tags` (comma-separated). Mirrors category exactly: new `ProductQueryService::get_filterable_tags()`, one more `tax_query` clause on the `product_tag` taxonomy (AND against the category clause — different taxonomies — OR within selected tags, same as category).

**e2e:**
Extend `tests/e2e/bin/seed.sh` with varied fixture data (different prices, categories, tags, and manually-set `_wc_average_rating`/`_wc_review_count` postmeta for a deterministic rating without needing real reviews). Extend `tests/e2e/tests/product-table.spec.ts` with assertions per new filter, plus a two-tables-on-one-page case proving the `queryId` collision fix. Update `/we2e`'s path-mapping table.

## Checkpoints
1. **`queryId` collision fix + Category multi-select** — checkboxes, `?query-1-categories=dictionary,clothing`. Test: single instance behaves as before; a page with the same pattern inserted twice filters each instance independently.
2. **Price range filter** — `?query-1-min-price=10&query-1-max-price=100`, `meta_query` merge refactor.
3. **Rating filter** — `?query-1-rating=4`.
4. **Product Tag filter** — `?query-1-tags=aa,bb`.
5. **e2e coverage** — seed + spec updates, `/we2e` doc update.

## Out of Scope
- Product attribute filters (Color/Size — `pa_*` taxonomies).
- Pixel-perfect UI redesign matching the reference screenshot.
- Renaming the existing `query-{id}-filter` (on-sale/in-stock) param — left as-is.
- Any URL scheme beyond `query-{id}-*` (no `ybod_` prefix, no separate instance-id param) — multi-instance correctness is handled by the `queryId` collision fix instead.

## Meta
- Target branch: `origin/jack/setup/claude` (current branch; not `develop`/`main`, so no new branch created)
- Base branch: develop
