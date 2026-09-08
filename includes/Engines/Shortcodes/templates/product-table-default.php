<?php
/**
 * Product Table shortcode template — default (non-archive) context.
 *
 * Renders the shared markup with the product query defaulting to "all products"
 * (overridable via `query.queryBy`).
 *
 * @var array  $attrs Normalized shortcode attributes from ProductTableShortcode::render().
 * @package product-table-default
 */

defined( 'ABSPATH' ) || exit;

$ybo_default_query_by = 'all';
require __DIR__ . '/parts/product-table.php';
