<?php
/**
 * Whether "Add selected items to cart" shows at all is re-derived from a
 * fresh (ids-only) query on every render — same reasoning as
 * product-table-pagination: `state.X` bindings only ever reflect the very
 * first server render's `data-wp-context` (the router preserves already-
 * hydrated client state across navigations instead of re-reading it), so a
 * value that must track the *current* filter/search/page has to be baked
 * directly into the markup here rather than read from context.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

use YayBulkOrder\Services\ProductQueryService;

$product_query_service = ProductQueryService::get_instance();
$has_products = $product_query_service->get_pagination_info( $block )['totalItems'] > 0;
?>

<div <?php echo get_block_wrapper_attributes( array( 'class' => 'ybo-bulk-action-wrap' ) ); ?>>
    <div class="ybo-bulk-action">
        <a
            href="#top"
            class="ybo-bulk-action__back-to-top"
            data-wp-on--click="actions.scrollToTop"
            data-wp-bind--hidden="!state.showBackToTop"
        ><?php esc_html_e( 'Go Back to Top ↑', 'yay-bulk-order' ); ?></a>

        <?php if ( $has_products ) : ?>
            <button
                type="button"
                class="ybo-bulk-action__submit"
                data-wp-on--click="actions.addSelectedToCart"
                data-wp-bind--disabled="state.isBulkAddDisabled"
                data-wp-class--is-loading="context.tableState.bulkAdding"
            >
                <span aria-hidden="true">🛒</span>
                <span data-wp-text="state.bulkAddToCartText"><?php esc_html_e( 'Add selected items to cart', 'yay-bulk-order' ); ?></span>
            </button>
        <?php endif; ?>

        <button
            type="button"
            class="ybo-bulk-action__clear"
            aria-label="<?php esc_attr_e( 'Clear selection', 'yay-bulk-order' ); ?>"
            data-wp-on--click="actions.clearSelection"
            data-wp-bind--hidden="!state.hasSelectedRows"
        >&#10005;</button>
    </div>

    <div class="ybo-cart-notice" data-wp-bind--hidden="!state.showCartNotice">
        <a class="ybo-cart-notice__link" data-wp-bind--href="state.cartUrl">
            <span class="ybo-cart-notice__icon" aria-hidden="true">🛍</span>
            <span data-wp-text="state.cartNoticeText"><?php esc_html_e( 'View cart', 'yay-bulk-order' ); ?></span>
        </a>

        <button
            type="button"
            class="ybo-cart-notice__close"
            aria-label="<?php esc_attr_e( 'Dismiss', 'yay-bulk-order' ); ?>"
            data-wp-on--click="actions.clearCartNotice"
        >&#10005;</button>
    </div>
</div>
