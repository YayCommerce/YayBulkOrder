<?php
/**
 * Toggle button for the category sidebar (product-table-filter-sidebar).
 * Both share `tableState.filter` state, so they don't need to be next to
 * each other in the block tree — this stays in the toolbar row, the sidebar
 * it opens/closes sits beside the table.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use YayBulkOrder\Services\ProductQueryService;

// Product taxonomy archives already scope the table — category filter is
// redundant, and a Hand-Picked collection has nothing left to filter.
if ( ProductQueryService::get_instance()->should_hide_filters( $block ) ) {
	return;
}
?>

<button
    <?php echo get_block_wrapper_attributes( array( 'class' => 'ybo-filter-toggle' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    type="button"
    data-wp-on--click="actions.toggleFilterPanel"
    data-wp-bind--aria-expanded="state.isFilterOpen"
    data-wp-class--is-active="state.isFilterActive"
>
    <?php esc_html_e( 'Filters', 'yay-bulk-order' ); ?>

    <span class="ybo-filter-toggle__icon" data-wp-bind--hidden="state.isFilterOpen" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 4H9.5M13 4H14.5M1.5 8H4.5M8 8H14.5M1.5 12H9.5M13 12H14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            <circle cx="11" cy="4" r="1.6" fill="currentColor"/>
            <circle cx="6" cy="8" r="1.6" fill="currentColor"/>
            <circle cx="11" cy="12" r="1.6" fill="currentColor"/>
        </svg>
    </span>
    <span class="ybo-filter-toggle__icon" data-wp-bind--hidden="!state.isFilterOpen" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    </span>
</button>
