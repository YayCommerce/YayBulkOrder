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

// Product taxonomy archives already scope the table — category filter is
// redundant, and a Hand-Picked collection has nothing left to filter.
if ( $product_query_service->should_hide_filters( $block ) ) {
	return;
}

$query_id = $block->context['queryId'] ?? 0;

// Each facet's options/counts are recalculated against every OTHER active
// filter (mirrors the WooCommerce shop-page filter widgets): picking a
// category narrows the rating/tag/price options shown, and vice versa.
$categories     = $product_query_service->get_filterable_categories( $block );
$selected_slugs = BlockHelper::get_category_param( $query_id );
$tags           = $product_query_service->get_filterable_tags( $block );
$selected_tags  = BlockHelper::get_tags_param( $query_id );
$price_bounds   = $product_query_service->get_price_bounds( $block );
$selected_ratings = BlockHelper::get_rating_param( $query_id );
$rating_counts   = $product_query_service->get_rating_counts( $block );

// A "Products by Category" collection already restricts the table to a
// fixed set of categories — the sidebar reflects that selection read-only
// instead of offering a second, conflicting way to filter.
$product_query        = $block->context['productQuery'] ?? [];
$locked_category_ids  = ( $product_query['queryType'] ?? '' ) === 'by-category'
	? array_map( 'absint', $product_query['categoryIds'] ?? [] )
	: [];
$is_category_locked   = ! empty( $locked_category_ids );
?>

<div
    <?php echo get_block_wrapper_attributes( array( 'class' => 'ybo-filter-sidebar' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    data-wp-bind--hidden="!state.isFilterOpen"
>
    <button
        type="button"
        class="ybo-filter-sidebar__clear"
        data-wp-bind--hidden="!state.hasActiveFilters"
        data-wp-on--click="actions.clearAllFilters"
    >
        <?php esc_html_e( 'Clear filters', 'yay-bulk-order' ); ?>
    </button>

    <?php if ( $price_bounds['max'] > $price_bounds['min'] ) : ?>
    <p class="ybo-filter-sidebar__title"><?php esc_html_e( 'Price', 'yay-bulk-order' ); ?></p>
    <hr class="ybo-filter-sidebar__divider" />

    <div
        class="ybo-filter-sidebar__price-slider"
        <?php echo wp_interactivity_data_wp_context( array( 'priceBounds' => $price_bounds ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    >
        <div class="ybo-filter-sidebar__price-slider-track">
            <div
                class="ybo-filter-sidebar__price-slider-fill"
                data-wp-style--left="state.priceSliderFillLeft"
                data-wp-style--right="state.priceSliderFillRight"
            ></div>
        </div>
        <span
            class="ybo-filter-sidebar__price-slider-thumb"
            data-wp-style--left="state.priceSliderFillLeft"
            data-wp-on--pointerdown="actions.startPriceDrag"
            <?php echo wp_interactivity_data_wp_context( array( 'priceSliderHandle' => 'min' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            aria-hidden="true"
        ></span>
        <span
            class="ybo-filter-sidebar__price-slider-thumb"
            data-wp-style--left="state.priceSliderMaxThumbLeft"
            data-wp-on--pointerdown="actions.startPriceDrag"
            <?php echo wp_interactivity_data_wp_context( array( 'priceSliderHandle' => 'max' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            aria-hidden="true"
        ></span>
        <input
            type="range"
            class="ybo-filter-sidebar__price-slider-input ybo-filter-sidebar__price-slider-input--min"
            min="<?php echo esc_attr( $price_bounds['min'] ); ?>"
            max="<?php echo esc_attr( $price_bounds['max'] ); ?>"
            step="1"
            data-wp-bind--value="state.priceRangeMinValue"
            data-wp-bind--max="state.priceRangeMaxValue"
            data-wp-on--input="actions.updateMinPrice"
            aria-label="<?php esc_attr_e( 'Minimum price', 'yay-bulk-order' ); ?>"
        />
        <input
            type="range"
            class="ybo-filter-sidebar__price-slider-input ybo-filter-sidebar__price-slider-input--max"
            min="<?php echo esc_attr( $price_bounds['min'] ); ?>"
            max="<?php echo esc_attr( $price_bounds['max'] ); ?>"
            step="1"
            data-wp-bind--value="state.priceRangeMaxValue"
            data-wp-bind--min="state.priceRangeMinValue"
            data-wp-on--input="actions.updateMaxPrice"
            aria-label="<?php esc_attr_e( 'Maximum price', 'yay-bulk-order' ); ?>"
        />
    </div>

    <div class="ybo-filter-sidebar__price-range">
        <input
            type="number"
            class="ybo-filter-sidebar__price-input"
            min="<?php echo esc_attr( $price_bounds['min'] ); ?>"
            max="<?php echo esc_attr( $price_bounds['max'] ); ?>"
            step="0.01"
            placeholder="<?php echo esc_attr( $price_bounds['min'] ); ?>"
            data-wp-bind--value="context.tableState.filter.priceRange.min"
            data-wp-on--change="actions.updateMinPrice"
            data-wp-on--keydown="actions.blockPriceSignKey"
            aria-label="<?php esc_attr_e( 'Minimum price', 'yay-bulk-order' ); ?>"
        />
        <span class="ybo-filter-sidebar__price-separator" aria-hidden="true">&ndash;</span>
        <input
            type="number"
            class="ybo-filter-sidebar__price-input"
            min="<?php echo esc_attr( $price_bounds['min'] ); ?>"
            max="<?php echo esc_attr( $price_bounds['max'] ); ?>"
            step="0.01"
            placeholder="<?php echo esc_attr( $price_bounds['max'] ); ?>"
            data-wp-bind--value="context.tableState.filter.priceRange.max"
            data-wp-on--change="actions.updateMaxPrice"
            data-wp-on--keydown="actions.blockPriceSignKey"
            aria-label="<?php esc_attr_e( 'Maximum price', 'yay-bulk-order' ); ?>"
        />
    </div>
    <?php endif; ?>

    <?php if ( array_sum( $rating_counts ) > 0 ) : ?>
        <p class="ybo-filter-sidebar__title"><?php esc_html_e( 'Rating', 'yay-bulk-order' ); ?></p>
        <hr class="ybo-filter-sidebar__divider" />

        <div class="ybo-filter-sidebar__list">
            <?php for ( $stars = 5; $stars >= 1; $stars-- ) : ?>
                <?php if ( empty( $rating_counts[ $stars ] ) ) : ?>
                    <?php continue; ?>
                <?php endif; ?>
                <label class="ybo-filter-sidebar__checkbox" data-wp-key="rating-<?php echo esc_attr( $stars ); ?>">
                    <input
                        type="checkbox"
                        <?php checked( in_array( $stars, $selected_ratings, true ) ); ?>
                        <?php echo wp_interactivity_data_wp_context( array( 'ratingValue' => $stars ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        data-wp-on--change="actions.toggleFilterRating"
                    />
                    <span
                        class="ybo-filter-sidebar__stars"
                        aria-label="<?php echo esc_attr( sprintf( /* translators: %d: star rating (1-5). */ _n( '%d star', '%d stars', $stars, 'yay-bulk-order' ), $stars ) ); ?>"
                    >
                        <?php for ( $icon = 1; $icon <= 5; $icon++ ) : ?>
                            <svg class="ybo-filter-sidebar__star<?php echo $icon <= $stars ? ' is-filled' : ''; ?>" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.85l-5.18 2.6.99-5.77-4.19-4.09 5.79-.84L10 1.5z" />
                            </svg>
                        <?php endfor; ?>
                    </span>
                    <span class="ybo-filter-sidebar__count">(<?php echo (int) $rating_counts[ $stars ]; ?>)</span>
                </label>
            <?php endfor; ?>
        </div>
    <?php endif; ?>

    <p class="ybo-filter-sidebar__title"><?php esc_html_e( 'Categories', 'yay-bulk-order' ); ?></p>
    <hr class="ybo-filter-sidebar__divider" />

    <div class="ybo-filter-sidebar__list">
        <?php foreach ( $categories as $category ) : ?>
            <?php
            $is_checked = $is_category_locked
                ? in_array( (int) $category->term_id, $locked_category_ids, true )
                : in_array( $category->slug, $selected_slugs, true );
            ?>
            <label
                class="ybo-filter-sidebar__checkbox<?php echo $is_category_locked ? ' ybo-filter-sidebar__checkbox--locked' : ''; ?>"
                data-wp-key="category-<?php echo esc_attr( $category->slug ); ?>"
            >
                <input
                    type="checkbox"
                    <?php checked( $is_checked ); ?>
                    <?php disabled( $is_category_locked ); ?>
                    <?php echo wp_interactivity_data_wp_context( array( 'categorySlug' => $category->slug ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    data-wp-on--change="actions.toggleFilterCategory"
                />
                <?php echo esc_html( $category->name ); ?> <span class="ybo-filter-sidebar__count">(<?php echo (int) $category->count; ?>)</span>
            </label>
        <?php endforeach; ?>
    </div>

    <?php if ( ! empty( $tags ) ) : ?>
        <p class="ybo-filter-sidebar__title"><?php esc_html_e( 'Tags', 'yay-bulk-order' ); ?></p>
        <hr class="ybo-filter-sidebar__divider" />

        <div class="ybo-filter-sidebar__list">
            <?php foreach ( $tags as $tag ) : ?>
                <label class="ybo-filter-sidebar__checkbox" data-wp-key="tag-<?php echo esc_attr( $tag->slug ); ?>">
                    <input
                        type="checkbox"
                        <?php checked( in_array( $tag->slug, $selected_tags, true ) ); ?>
                        <?php echo wp_interactivity_data_wp_context( array( 'tagSlug' => $tag->slug ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        data-wp-on--change="actions.toggleFilterTag"
                    />
                    <?php echo esc_html( $tag->name ); ?> <span class="ybo-filter-sidebar__count">(<?php echo (int) $tag->count; ?>)</span>
                </label>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>
