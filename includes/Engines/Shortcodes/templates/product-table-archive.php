<?php
/**
 * Product Table shortcode template — WooCommerce product archives (Shop, category, tag).
 *
 * Renders the shared markup with the product query defaulting to inherit the
 * current archive context (overridable via `query.queryBy`).
 *
 * @var array  $attrs Normalized shortcode attributes from ProductTableShortcode::render().
 * @package product-table-archive
 */

defined( 'ABSPATH' ) || exit;

$ybo_default_query_by = 'inherit';
require __DIR__ . '/parts/product-table.php';
