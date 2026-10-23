=== Yay Bulk Order for WooCommerce ===
Contributors: yaycommerce
Tags: woocommerce, bulk order, product table, quick order, wholesale
Requires at least: 6.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.2.1.7
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
* `[ybo-product-table]` shortcode.
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

= 0.2.1.7 =
* Added: Compatibility with WooCommerce 11.2 Store API changes.
* Added: Error notice when WooCommerce rejects an item during add to cart (quantity rules, stock, rate limits).
* Added: Product Table filter sidebar with category multi-select, tag, price and rating filters.
* Fixed: Category picker showed 2 checkboxes per row in the block editor.

= Earlier =
* Added: Variant Table block (Pro).
* Added: Gutenberg block color editor.
* Added: Use a table on the shop page (classic themes) and link to the shop catalog template.
* Added: Create pattern and create new page actions.
* Added: Compatibility with YayWholesale.
