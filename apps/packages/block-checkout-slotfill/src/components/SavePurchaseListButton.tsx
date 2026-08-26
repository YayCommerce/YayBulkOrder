import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const { ybo_meta, wc_meta } = window.yayBulkOrderSlotFill;

export default function SavePurchaseListButton() {
  const isVisible = useMemo(
    () =>
      (wc_meta.isCart && ybo_meta.settings.purchaseList.savePurchaseListButton.isAddToCartPage) ||
      (wc_meta.isCheckout && ybo_meta.settings.purchaseList.savePurchaseListButton.isAddToCheckoutPage),
    [ybo_meta, wc_meta],
  );

  return (
    isVisible && (
      <div className="ybo_slotfill_button_container">
        <button className="ybo_save_pl_cart_button wp-element-button">
          {__('Save as Purchase list', 'yay-bulk-order')}
        </button>
      </div>
    )
  );
}
