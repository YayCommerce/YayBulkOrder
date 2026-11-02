#!/usr/bin/env bash
# Seeds the WordPress/WooCommerce data the Product Table smoke spec needs:
# 3 published products with fixed SKUs, and a Page whose content is the real
# registered "yay-bulk-order/simple-product-table" block pattern — the same
# content a user gets by inserting that pattern from the block editor.
#
# Runs as .wp-env.json's afterStart lifecycle script. Safe to re-run: skips
# straight to exit if the fixture page already exists.
set -euo pipefail

CONFIG="${1:-.wp-env.json}"
WP="wp-env run cli --config=$CONFIG wp"

if $WP post list --post_type=page --name=e2e-product-table --field=ID | grep -q .; then
    echo 'e2e fixtures already seeded, skipping.'
    exit 0
fi

echo -e 'Verifying WooCommerce + Yay Bulk Order are active \n'
# wp-env auto-activates every plugin listed in .wp-env.json on start, so no
# explicit `wp plugin activate` here — the mapped local plugin's container
# folder name (hence its wp-cli slug) depends on this checkout's directory
# name, which isn't reliably "yay-bulk-order". Fail loudly instead of
# guessing a slug that might not match.
$WP eval '
if ( ! function_exists( "WC" ) ) {
    WP_CLI::error( "WooCommerce is not active — check the \"plugins\" list in .wp-env.json." );
}
if ( ! function_exists( "register_block_pattern" ) || ! did_action( "plugins_loaded" ) ) {
    WP_CLI::error( "Yay Bulk Order does not appear to be loaded — check the \"plugins\" list in .wp-env.json." );
}
'

echo -e 'Setting permalink structure \n'
$WP rewrite structure '/%postname%/' --hard

echo -e 'Skipping WooCommerce onboarding wizard \n'
$WP option update woocommerce_onboarding_profile '{"skipped":true}' --format=json
$WP option update woocommerce_coming_soon no

echo -e 'Creating e2e products \n'
PRODUCT_ONE_ID=$($WP wc product create --name='E2E Product One' --sku='YBO-E2E-1' --regular_price='10.00' --status=publish --user=admin --porcelain)
PRODUCT_TWO_ID=$($WP wc product create --name='E2E Product Two' --sku='YBO-E2E-2' --regular_price='20.00' --status=publish --user=admin --porcelain)
$WP wc product create --name='E2E Product Three' --sku='YBO-E2E-3' --regular_price='30.00' --status=publish --user=admin

echo -e 'Creating e2e categories and assigning products (for the category filter spec) \n'
$WP term create product_cat 'E2E Category A' --slug=e2e-cat-a
$WP term create product_cat 'E2E Category B' --slug=e2e-cat-b
$WP post term add "$PRODUCT_ONE_ID" product_cat e2e-cat-a
$WP post term add "$PRODUCT_TWO_ID" product_cat e2e-cat-b

echo -e 'Creating e2e tags and assigning products (for the tag filter spec) \n'
$WP term create product_tag 'E2E Tag A' --slug=e2e-tag-a
$WP term create product_tag 'E2E Tag B' --slug=e2e-tag-b
$WP post term add "$PRODUCT_ONE_ID" product_tag e2e-tag-a
$WP post term add "$PRODUCT_TWO_ID" product_tag e2e-tag-b

echo -e 'Seeding cached ratings for the rating filter spec (WooCommerce'"'"'s own cache meta, no real reviews needed) \n'
$WP post meta update "$PRODUCT_ONE_ID" _wc_average_rating 5.00
$WP post meta update "$PRODUCT_ONE_ID" _wc_review_count 3
$WP post meta update "$PRODUCT_TWO_ID" _wc_average_rating 3.00
$WP post meta update "$PRODUCT_TWO_ID" _wc_review_count 2

echo -e 'Creating the Product Table page from the registered block pattern \n'
$WP eval '
$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( "yay-bulk-order/simple-product-table" );
if ( ! $pattern ) {
    WP_CLI::error( "Pattern yay-bulk-order/simple-product-table is not registered." );
}
$post_id = wp_insert_post( array(
    "post_title"   => "E2E Product Table",
    "post_name"    => "e2e-product-table",
    "post_type"    => "page",
    "post_status"  => "publish",
    "post_content" => $pattern["content"],
) );
WP_CLI::success( "Created page {$post_id}" );
'

echo -e 'Creating a page with the SAME pattern inserted twice (queryId collision regression test) \n'
$WP eval '
$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( "yay-bulk-order/simple-product-table" );
if ( ! $pattern ) {
    WP_CLI::error( "Pattern yay-bulk-order/simple-product-table is not registered." );
}
$post_id = wp_insert_post( array(
    "post_title"   => "E2E Product Table Duplicate",
    "post_name"    => "e2e-product-table-duplicate",
    "post_type"    => "page",
    "post_status"  => "publish",
    "post_content" => $pattern["content"] . $pattern["content"],
) );
WP_CLI::success( "Created page {$post_id}" );
'
