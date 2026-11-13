import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const { ybod_meta, wc_meta } = window.yayBulkOrderSlotFill;

export default function SavePurchaseListButton() {
  const isVisible = useMemo(
    () =>
      (wc_meta.isCart && ybod_meta.settings.purchaseList.savePurchaseListButton.isAddToCartPage) ||
      (wc_meta.isCheckout && ybod_meta.settings.purchaseList.savePurchaseListButton.isAddToCheckoutPage),
    [ybod_meta, wc_meta],
  );

  return (
    isVisible && (
      <div className="ybod_slotfill_button_container">
        <button className="ybod_save_pl_cart_button wp-element-button">
          {__('Save as Purchase list', 'yay-bulk-order')}
        </button>
      </div>
    )
  );
}
