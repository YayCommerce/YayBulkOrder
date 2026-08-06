import { useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  const blockProps = useBlockProps.save();

  return (
    <div {...blockProps} className={`${blockProps.className ?? ''} ybo-bulk-action-wrap`}>
      <div className="ybo-bulk-action">
        <a href="#top" className="ybo-bulk-action__back-to-top" data-wp-on--click="actions.scrollToTop">
          Go Back to Top ↑
        </a>

        <button
          type="button"
          className="ybo-bulk-action__submit"
          data-wp-on--click="actions.addSelectedToCart"
          data-wp-bind--disabled="state.isBulkAddDisabled"
          data-wp-class--is-loading="context.tableState.bulkAdding"
        >
          <span aria-hidden="true">🛒</span>
          <span data-wp-text="state.bulkAddToCartText">Add selected items to cart</span>
        </button>

        <button
          type="button"
          className="ybo-bulk-action__clear"
          aria-label="Clear selection"
          data-wp-on--click="actions.clearSelection"
          data-wp-bind--hidden="!state.hasSelectedRows"
        >
          &#10005;
        </button>
      </div>

      <div className="ybo-cart-notice" data-wp-bind--hidden="!state.showCartNotice">
        <a className="ybo-cart-notice__link" data-wp-bind--href="state.cartUrl">
          <span className="ybo-cart-notice__icon" aria-hidden="true">
            🛍
          </span>
          <span data-wp-text="state.cartNoticeText">View cart</span>
        </a>

        <button
          type="button"
          className="ybo-cart-notice__close"
          aria-label="Dismiss"
          data-wp-on--click="actions.clearCartNotice"
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}
