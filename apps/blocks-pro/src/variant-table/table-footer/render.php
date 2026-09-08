<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
    <span class="ybo-variant-bulk-action-sentinel" aria-hidden="true" data-wp-init="callbacks.watchBulkActionVisibility"></span>

    <div class="ybo-variant-table-total">
        <span class="ybo-variant-table-total__label"><?php esc_html_e( 'Total:', 'yay-bulk-order' ); ?></span>
        <span class="ybo-variant-table-total__amount" data-wp-text="state.totalFormatted"></span>
    </div>

    <div class="ybo-variant-table-actions" data-wp-class--is-floating="state.showFloatingBulkAction">
        <button
            type="button"
            class="ybo-variant-table-add-to-cart"
            data-wp-on--click="actions.addSelectedToCart"
            data-wp-bind--disabled="state.isAddToCartDisabled"
            data-wp-class--is-loading="context.tableState.bulkAdding"
        >
            <span class="ybo-icon-cart" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.4189 20.9995H7.57253C4.69037 20.9995 2.47928 19.9624 3.10734 15.7881L3.83863 10.131C4.22578 8.04812 5.55932 7.25098 6.72939 7.25098H16.2964C17.4837 7.25098 18.7398 8.10812 19.1872 10.131L19.9185 15.7881C20.4519 19.4909 18.301 20.9995 15.4189 20.9995Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15.5476 7.04574C15.5476 4.81136 13.7295 3.00004 11.4867 3.00004C10.4067 2.99548 9.36944 3.41971 8.60416 4.17892C7.83888 4.93813 7.40868 5.96978 7.40869 7.04574H7.40869" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15.1016 11.5496H15.0568" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7.94337 11.5496H7.89863" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
            <span data-wp-text="state.addToCartText"><?php esc_html_e( 'Add to cart', 'yay-bulk-order' ); ?></span>
        </button>

        <button
            type="button"
            class="ybo-variant-table-clear"
            aria-label="<?php esc_attr_e( 'Clear selection', 'yay-bulk-order' ); ?>"
            data-wp-on--click="actions.clearSelection"
            data-wp-bind--hidden="!state.hasSelectedRows"
        >
            <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    </div>

    <div class="ybo-variant-table-cart-notice" data-wp-bind--hidden="!state.showCartNotice">
        <a class="ybo-variant-table-cart-notice__link" data-wp-bind--href="state.cartUrl">
            <span class="ybo-variant-table-cart-notice__icon" aria-hidden="true">
                <svg width="23px" height="24px" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.4189 20.9995H7.57253C4.69037 20.9995 2.47928 19.9624 3.10734 15.7881L3.83863 10.131C4.22578 8.04812 5.55932 7.25098 6.72939 7.25098H16.2964C17.4837 7.25098 18.7398 8.10812 19.1872 10.131L19.9185 15.7881C20.4519 19.4909 18.301 20.9995 15.4189 20.9995Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15.5476 7.04574C15.5476 4.81136 13.7295 3.00004 11.4867 3.00004C10.4067 2.99548 9.36944 3.41971 8.60416 4.17892C7.83888 4.93813 7.40868 5.96978 7.40869 7.04574H7.40869" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15.1016 11.5496H15.0568" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7.94337 11.5496H7.89863" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
            <span data-wp-text="state.cartNoticeText"><?php esc_html_e( 'View cart', 'yay-bulk-order' ); ?></span>
        </a>

        <button
            type="button"
            class="ybo-variant-table-cart-notice__close"
            aria-label="<?php esc_attr_e( 'Dismiss', 'yay-bulk-order' ); ?>"
            data-wp-on--click="actions.clearCartNotice"
        >
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    </div>
</div>
