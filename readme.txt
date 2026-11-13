=== Yay Bulk Order for WooCommerce ===
Contributors: yaycommerce
Tags: woocommerce, bulk order, product table, quick order, wholesale
Requires at least: 6.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
WC requires at least: 10.0.0
WC tested up to: 11.2

Let shoppers add many products and variations to the cart from one product table.

== Description ==

Yay Bulk Order shows your WooCommerce products in an order table. Shoppers set quantities, select rows and add all of them to the cart with one click. It is made for B2B, wholesale and repeat buyers who know what they want.

= Product Table =

* Build tables in the admin with a step-by-step builder: Products, Columns, Features, Publish.
* Query products by: all, category, featured, on sale or hand-picked.
* Columns: product, description, SKU, quantity, select, subtotal, add to cart.
* Add a single row to the cart, or select many rows and bulk add.
* Variable products: expand a row to order variations. "Any" attributes resolve automatically.
* Filter sidebar: categories (multi-select), tags, price range and rating.
* Search and pagination.
* A floating cart summary with the cart total and a "View cart" link.
* Clear error messages when WooCommerce rejects an item (stock, quantity rules, rate limits).

= Show the table anywhere =

* Gutenberg blocks and block patterns ("Full-featured" and "Simple" product tables).
* `[yaybulkorder-product-table]` shortcode.
* Replace the shop page product loop (classic themes) or link to the shop catalog template (block themes).
* "Create new page" from a saved table.

= Design =

* Color presets with a live preview.
* Block color controls in the editor.
* Default cart quantity and default page size.

= Pro features =

* **Variant Table**: order many variations of one product from a table on the product page.
* **Purchase List**: save a cart as a named list, then reorder it in one click. Save from the cart, mini-cart, checkout or a past order. Download a list as CSV.
* **Quick CSV Order**: upload a CSV file to add many products to the cart at once.
* More table patterns and extra Product Table columns.

= Compatibility =

* WooCommerce Cart and Checkout blocks, and the classic cart.
* YayWholesale B2B and YayPricing: wholesale prices and quantity rules show in the table.
* Uses the WooCommerce Store API for add to cart.

== Source Code ==

This plugin ships compiled JavaScript and CSS in the `assets/dist/` folder. The human-readable source code of these files is public, and you can review, study and fork it:

[https://github.com/YayCommerce/YayBulkOrder](https://github.com/YayCommerce/YayBulkOrder)

= Compiled files and their source =

* `assets/dist/blocks/product-table/` (Product Table block editor scripts and styles): [apps/blocks/src/product-table](https://github.com/YayCommerce/YayBulkOrder/tree/main/apps/blocks/src/product-table)
* `assets/dist/blocks/common/` (Cart Summary block): [apps/blocks/src/common](https://github.com/YayCommerce/YayBulkOrder/tree/main/apps/blocks/src/common)
* `assets/dist/product-table-store/` (Product Table frontend store): [apps/packages/product-table-store](https://github.com/YayCommerce/YayBulkOrder/tree/main/apps/packages/product-table-store)
* `assets/dist/page-admin/` (admin app): [apps/app-admin/src](https://github.com/YayCommerce/YayBulkOrder/tree/main/apps/app-admin/src)
* Code shared by these files: [apps/packages/common](https://github.com/YayCommerce/YayBulkOrder/tree/main/apps/packages/common)

The blocks and the frontend store are built with `@wordpress/scripts` (webpack). The admin app is built with Vite.

= Build from source =

You need Node.js 24 and PNPM 11. Run these commands:

1. `git clone https://github.com/YayCommerce/YayBulkOrder.git`
2. `cd YayBulkOrder`
3. `pnpm install`
4. `pnpm build` (builds the blocks and the frontend store)
5. `pnpm build:admin:lite` (builds the admin app)

The compiled files go to `assets/dist/`.

== Installation ==

1. Install and activate WooCommerce.
2. Upload the `yay-bulk-order` folder to `/wp-content/plugins/`, or install the plugin from Plugins > Add New.
3. Activate the plugin.
4. Go to YayCommerce > Yay Bulk Order.
5. Create a product table, then add it to a page with the block, a pattern or the shortcode.

== Frequently Asked Questions ==

= Does it work with variable products? =

Yes. Expand a row to order its variations. With Pro, the Variant Table block shows all variations of one product.

= Does it work with block themes and classic themes? =

Yes. Use the blocks or patterns in block themes. In classic themes, use the shortcode or replace the shop page loop.

= Why did an item not go into the cart? =

WooCommerce or another plugin rejected it, for example because of low stock or a quantity rule. The table shows the reason. Valid items in the same bulk add still go into the cart.

= Do I need the Pro version? =

No. The Product Table is free. Pro adds the Variant Table, Purchase List and Quick CSV Order.

== Screenshots ==

1. Product Table on the storefront with bulk add to cart.
2. Product Table filter sidebar.
3. Table builder in the admin.
4. Design settings with live preview.

== Changelog ==

= 1.0.3 =
* Fix a crash when other Pro plugins are active.
* Fix the table layout in classic themes: width, images, checkboxes and mobile scroll.
* Fix auto update on Pro version

= 1.0.2 =
* Initial release.
* Added Product Table for ordering multiple products.
* Added Product Table Builder.
* Added customizable Columns Manager.
* Added Full Features and Simple Product Table templates.
* Added Gutenberg block and shortcode display options.
* Added general and design settings.