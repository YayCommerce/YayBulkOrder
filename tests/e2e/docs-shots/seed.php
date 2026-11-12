<?php
/**
 * Demo data for the docs screenshots (`pnpm docs:shots`), on the docs site
 * only (port 8891, docs-shots/.wp-env.json): WooCommerce's sample products
 * with their images, sizes on the Sweater for the Variant Table, a completed
 * order, the plugin's settings, two saved tables and three purchase lists.
 * Safe to run again: it replaces its own data and keeps the products.
 *
 * run.sh pipes it to `wp eval-file -`.
 *
 * @package yaycommerce/yay-bulk-order
 */

if ( false === strpos( home_url(), 'localhost:8891' ) ) {
    WP_CLI::error( 'Refusing to seed ' . home_url() . ': not the docs screenshot site.' );
}
if ( ! function_exists( 'WC' ) || ! class_exists( 'YayBulkOrder\\Pro\\YayBulkOrderPro' ) ) {
    WP_CLI::error( 'WooCommerce and Yay Bulk Order (with its Pro code) must be active.' );
}

wp_set_current_user( 1 );

/** A REST request as admin; fails the seed on an error status. */
$request = static function ( string $method, string $route, array $body = array() ) {
    $request = new WP_REST_Request( $method, $route );
    if ( $body ) {
        $request->set_header( 'content-type', 'application/json' );
        $request->set_body( wp_json_encode( $body ) );
    }
    $response = rest_do_request( $request );
    if ( $response->get_status() >= 300 ) {
        WP_CLI::error( "$method $route: " . $response->get_status() . ' ' . wp_json_encode( $response->get_data() ) );
    }
    return $response->get_data();
};

// Site basics.
switch_theme( 'brandy' );
update_option( 'permalink_structure', '/%postname%/' );
flush_rewrite_rules( true );
update_option( 'woocommerce_coming_soon', 'no' );
update_option( 'woocommerce_onboarding_profile', array( 'skipped' => true ) );
update_option( 'blogname', 'Yay Bulk Order Demo' );

// No editor welcome guides over the shots.
global $wpdb;
$guides_off = array(
    'welcomeGuide'         => false,
    'welcomeGuidePage'     => false,
    'welcomeGuideTemplate' => false,
    'welcomeGuideStyles'   => false,
);
update_user_meta(
    1,
    $wpdb->get_blog_prefix() . 'persisted_preferences',
    array(
        'core'           => $guides_off,
        'core/edit-post' => $guides_off,
        'core/edit-site' => $guides_off,
        '_modified'      => gmdate( 'c' ),
    )
);

// WooCommerce's sample products, with images (downloaded once).
if ( count( wc_get_products( array( 'limit' => 5, 'return' => 'ids' ) ) ) < 5 ) {
    $request( 'POST', '/wc-admin/onboarding/tasks/import_sample_products' );
}

// Sizes on the Sweater: the Variant Table needs a product with variations.
$sweater_id = wc_get_product_id_by_sku( 'woo-fashion-sweater' );
$sweater    = wc_get_product( $sweater_id );
if ( ! $sweater instanceof WC_Product_Variable ) {
    WP_CLI::error( 'The sample Sweater (woo-fashion-sweater) is missing or not variable.' );
}
if ( ! $sweater->get_children() ) {
    $size = new WC_Product_Attribute();
    $size->set_name( 'Size' );
    $size->set_options( array( 'Small', 'Medium', 'Large' ) );
    $size->set_visible( true );
    $size->set_variation( true );
    $sweater->set_attributes( array( $size ) );
    $sweater->save();
    foreach ( array( 'Small' => '42', 'Medium' => '42', 'Large' => '45' ) as $option => $price ) {
        $variation = new WC_Product_Variation();
        $variation->set_parent_id( $sweater_id );
        $variation->set_attributes( array( 'size' => $option ) );
        $variation->set_sku( 'woo-fashion-sweater-' . strtolower( $option ) );
        $variation->set_regular_price( $price );
        $variation->set_image_id( $sweater->get_image_id() );
        $variation->set_status( 'publish' );
        $variation->save();
    }
    WC_Product_Variable::sync( $sweater_id );
}

// A completed order, for the order details page.
$hat_id   = wc_get_product_id_by_sku( 'woo-fashion-hat' );
$shirt_id = wc_get_product_id_by_sku( 'woo-fashion-shirt' );
if ( ! wc_get_orders( array( 'customer_id' => 1, 'status' => 'completed', 'limit' => 1, 'return' => 'ids' ) ) ) {
    $order = wc_create_order( array( 'customer_id' => 1 ) );
    $order->add_product( wc_get_product( $hat_id ), 2 );
    $order->add_product( wc_get_product( $shirt_id ), 3 );
    $order->set_address(
        array(
            'first_name' => 'Olivia',
            'last_name'  => 'Parker',
            'address_1'  => '120 Harbor Street',
            'city'       => 'Portland',
            'postcode'   => '97201',
            'country'    => 'US',
            'state'      => 'OR',
            'email'      => 'olivia.parker@example.com',
        ),
        'billing'
    );
    $order->calculate_totals();
    $order->update_status( 'completed' );
}

// Plugin settings: every "Save as Purchase list" button and the Quick Order page on.
$settings = $request( 'GET', '/yay-bulk-order/v1/settings' );
$settings['purchaseList']['savePurchaseListButton'] = array(
    'isAddToCartPage'     => true,
    'isAddToCheckoutPage' => true,
    'isAddToMiniCart'     => true,
    'isAddToOrder'        => true,
);
$settings['csvOrder']['isAddToAccountPage'] = true;
$request( 'POST', '/yay-bulk-order/v1/settings', $settings );

// Replace the plugin data from earlier runs.
foreach ( get_posts( array( 'post_type' => array( 'yaybulkorder_table', 'yaybulkorder_plist' ), 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids' ) ) as $post_id ) {
    wp_delete_post( $post_id, true );
}
foreach ( get_posts( array( 'post_type' => 'wp_block', 'post_status' => 'any', 'numberposts' => -1 ) ) as $pattern ) {
    if ( 0 === strpos( $pattern->post_title, 'Clothing' ) ) {
        wp_delete_post( $pattern->ID, true );
    }
}
foreach ( array( 'docs-block-design', 'docs-variant-table' ) as $slug ) {
    $page = get_page_by_path( $slug );
    if ( $page ) {
        wp_delete_post( $page->ID, true );
    }
}
$custom_catalog = get_block_template( 'brandy//archive-product' );
if ( $custom_catalog && 'custom' === $custom_catalog->source && $custom_catalog->wp_id ) {
    wp_delete_post( $custom_catalog->wp_id, true );
}
WC()->initialize_session();

$column = static fn( string $slug, string $heading, bool $enabled = true, string $responsive = 'always-show' ): array => array(
    'slug'       => $slug,
    'heading'    => $heading,
    'enabled'    => $enabled,
    'responsive' => $responsive,
);

// Two saved tables for the list and its actions.
$clothing = get_term_by( 'slug', 'clothing', 'product_cat' );
$request(
    'POST',
    '/yay-bulk-order/v1/product-tables',
    array(
        'title'    => 'Full Product Table',
        'query'    => array( 'queryBy' => 'all-products' ),
        'columns'  => array( $column( 'product', 'Product' ), $column( 'sku', 'SKU' ), $column( 'description', 'Description', false ), $column( 'quantity', 'Quantity' ), $column( 'subtotal', 'Subtotal' ), $column( 'add-to-cart', 'Add to Cart' ) ),
        'features' => array( 'hasFilter' => true, 'hasSearch' => true, 'hasPagination' => true, 'pageSize' => 10 ),
    )
);
$request(
    'POST',
    '/yay-bulk-order/v1/product-tables',
    array(
        'title'    => 'Clothing Order Form',
        'query'    => array( 'queryBy' => 'by-category', 'categories' => array( (int) $clothing->term_id ) ),
        'columns'  => array( $column( 'product', 'Product' ), $column( 'sku', 'SKU' ), $column( 'quantity', 'Quantity' ), $column( 'subtotal', 'Subtotal' ), $column( 'add-to-cart', 'Add to Cart' ) ),
        'features' => array( 'hasFilter' => false, 'hasSearch' => true, 'hasPagination' => true, 'pageSize' => 10 ),
    )
);

// Three purchase lists for the admin, who plays the customer in the shots.
$id = static fn( string $sku ): int => (int) wc_get_product_id_by_sku( $sku );
$lists = array(
    'Weekly Restock'    => array( array( 'woo-fashion-shirt', 6 ), array( 'woo-fashion-shirt-green', 4 ), array( 'woo-fashion-socks', 10 ) ),
    'Winter Collection' => array( array( 'woo-fashion-jacket', 2 ), array( 'woo-fashion-hat', 3 ) ),
    'Shoe Restock'      => array( array( 'woo-fashion-shoes', 5 ) ),
);
foreach ( $lists as $name => $items ) {
    $products = array();
    foreach ( $items as [ $sku, $quantity ] ) {
        $products[] = array(
            'productId' => $id( $sku ),
            'quantity'  => $quantity,
        );
    }
    $request( 'POST', '/yay-bulk-order/v1/purchase-list', array( 'name' => $name, 'products' => $products ) );
}

WP_CLI::success( 'Docs demo data is ready.' );
