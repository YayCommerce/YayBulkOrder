<?php
/**
 * Category sidebar toggled by product-table-filter's button. Single-select:
 * clicking a category (or "All Products") applies (navigates) immediately.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

use YayBulkOrder\Services\ProductQueryService;
use YayBulkOrder\Utils\BlockHelper;

$product_query_service = ProductQueryService::get_instance();

// Product taxonomy archives already scope the table — category filter is redundant.
if ( $product_query_service->should_hide_filters() ) {
	return;
}

$query_id = $block->context['queryId'] ?? 0;

$categories     = $product_query_service->get_filterable_categories();
$selected_slugs = BlockHelper::get_category_param( $query_id );
$selected_slug  = $selected_slugs[0] ?? '';
?>

<div
    <?php echo get_block_wrapper_attributes( array( 'class' => 'ybo-filter-sidebar' ) ); ?>
    data-wp-bind--hidden="!state.isFilterOpen"
>
    <p class="ybo-filter-sidebar__title"><?php esc_html_e( 'Categories', 'yay-bulk-order' ); ?></p>
    <hr class="ybo-filter-sidebar__divider" />

    <div class="ybo-filter-sidebar__list">
        <button
            type="button"
            class="ybo-filter-sidebar__link<?php echo '' === $selected_slug ? ' is-active' : ''; ?>"
            <?php echo wp_interactivity_data_wp_context( array( 'categorySlug' => '' ) ); ?>
            data-wp-on--click="actions.selectFilterCategory"
        ><?php esc_html_e( 'All Products', 'yay-bulk-order' ); ?></button>

        <?php foreach ( $categories as $category ) : ?>
            <button
                type="button"
                class="ybo-filter-sidebar__link<?php echo $category->slug === $selected_slug ? ' is-active' : ''; ?>"
                <?php echo wp_interactivity_data_wp_context( array( 'categorySlug' => $category->slug ) ); ?>
                data-wp-on--click="actions.selectFilterCategory"
            ><?php echo esc_html( $category->name ); ?></button>
        <?php endforeach; ?>
    </div>
</div>
