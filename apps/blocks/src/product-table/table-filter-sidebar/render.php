<?php
/**
 * Category sidebar toggled by product-table-filter's button. Multi-select:
 * checking/unchecking a category applies (navigates) immediately. No
 * selection at all means "All Products".
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
$tags           = $product_query_service->get_filterable_tags();
$selected_tags  = BlockHelper::get_tags_param( $query_id );
$price_bounds   = $product_query_service->get_price_bounds();
$selected_rating = BlockHelper::get_rating_param( $query_id );
?>

<div
    <?php echo get_block_wrapper_attributes( array( 'class' => 'ybod-filter-sidebar' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    data-wp-bind--hidden="!state.isFilterOpen"
>
    <p class="ybod-filter-sidebar__title"><?php esc_html_e( 'Price', 'yay-bulk-order' ); ?></p>
    <hr class="ybod-filter-sidebar__divider" />

    <div class="ybod-filter-sidebar__price-range">
        <input
            type="number"
            class="ybod-filter-sidebar__price-input"
            min="<?php echo esc_attr( $price_bounds['min'] ); ?>"
            max="<?php echo esc_attr( $price_bounds['max'] ); ?>"
            step="0.01"
            placeholder="<?php echo esc_attr( $price_bounds['min'] ); ?>"
            data-wp-bind--value="context.tableState.filter.priceRange.min"
            data-wp-on--change="actions.updateMinPrice"
            aria-label="<?php esc_attr_e( 'Minimum price', 'yay-bulk-order' ); ?>"
        />
        <span class="ybod-filter-sidebar__price-separator" aria-hidden="true">&ndash;</span>
        <input
            type="number"
            class="ybod-filter-sidebar__price-input"
            min="<?php echo esc_attr( $price_bounds['min'] ); ?>"
            max="<?php echo esc_attr( $price_bounds['max'] ); ?>"
            step="0.01"
            placeholder="<?php echo esc_attr( $price_bounds['max'] ); ?>"
            data-wp-bind--value="context.tableState.filter.priceRange.max"
            data-wp-on--change="actions.updateMaxPrice"
            aria-label="<?php esc_attr_e( 'Maximum price', 'yay-bulk-order' ); ?>"
        />
    </div>

    <p class="ybod-filter-sidebar__title"><?php esc_html_e( 'Rating', 'yay-bulk-order' ); ?></p>
    <hr class="ybod-filter-sidebar__divider" />

    <div class="ybod-filter-sidebar__list">
        <?php for ( $stars = 5; $stars >= 1; $stars-- ) : ?>
            <label class="ybod-filter-sidebar__checkbox">
                <input
                    type="checkbox"
                    <?php checked( $selected_rating === $stars ); ?>
                    <?php echo wp_interactivity_data_wp_context( array( 'ratingValue' => $stars ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    data-wp-on--change="actions.toggleFilterRating"
                />
                <?php
                echo esc_html(
                    sprintf(
                        /* translators: %d: minimum star rating (1-5). */
                        _n( '%d star & up', '%d stars & up', $stars, 'yay-bulk-order' ),
                        $stars
                    )
                );
                ?>
            </label>
        <?php endfor; ?>
    </div>

    <p class="ybod-filter-sidebar__title"><?php esc_html_e( 'Categories', 'yay-bulk-order' ); ?></p>
    <hr class="ybod-filter-sidebar__divider" />

    <div class="ybod-filter-sidebar__list">
        <?php foreach ( $categories as $category ) : ?>
            <label class="ybod-filter-sidebar__checkbox">
                <input
                    type="checkbox"
                    <?php checked( in_array( $category->slug, $selected_slugs, true ) ); ?>
                    <?php echo wp_interactivity_data_wp_context( array( 'categorySlug' => $category->slug ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    data-wp-on--change="actions.toggleFilterCategory"
                />
                <?php echo esc_html( $category->name ); ?>
            </label>
        <?php endforeach; ?>
    </div>

    <?php if ( ! empty( $tags ) ) : ?>
        <p class="ybod-filter-sidebar__title"><?php esc_html_e( 'Tags', 'yay-bulk-order' ); ?></p>
        <hr class="ybod-filter-sidebar__divider" />

        <div class="ybod-filter-sidebar__list">
            <?php foreach ( $tags as $tag ) : ?>
                <label class="ybod-filter-sidebar__checkbox">
                    <input
                        type="checkbox"
                        <?php checked( in_array( $tag->slug, $selected_tags, true ) ); ?>
                        <?php echo wp_interactivity_data_wp_context( array( 'tagSlug' => $tag->slug ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        data-wp-on--change="actions.toggleFilterTag"
                    />
                    <?php echo esc_html( $tag->name ); ?>
                </label>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>
