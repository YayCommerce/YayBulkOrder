import { getCurrentCart, watchExternalCartChanges, type StoreApiCart } from './storeApi';
import { formatCartSubtotal } from './storeApi/currency';

/** The slice of Product Table state that cart synchronization publishes to. */
export type CartSyncState = {
  externalCartQuantities: Record<number, number>;
  externalCartTotalFormatted: string;
  hasSyncedExternalCart: boolean;
};

export type CartSyncApi = {
  applyCartQuantities: (cart: StoreApiCart) => void;
};

export function initCartSync(state: CartSyncState): CartSyncApi {
  // Publish the latest cart state.
  function applyCartQuantities(cart: StoreApiCart): void {
    const quantities: Record<number, number> = {};
    for (const item of cart.items) {
      quantities[item.id] = item.quantity;
    }
    state.externalCartQuantities = quantities;
    state.externalCartTotalFormatted = formatCartSubtotal(cart.totals);
    state.hasSyncedExternalCart = true;
  }

  // Prevent overlapping sync requests.
  let isSyncingExternalCart = false;

  // Refresh state from the current cart.
  async function syncExternalCartQuantities(): Promise<void> {
    if (isSyncingExternalCart) {
      return;
    }

    isSyncingExternalCart = true;
    try {
      const currentCart = await getCurrentCart();
      applyCartQuantities(currentCart);
    } catch (error) {
      console.error('Failed to sync the cart after an external change', error);
    } finally {
      isSyncingExternalCart = false;
    }
  }

  // Watch for cart changes outside this module.
  watchExternalCartChanges(syncExternalCartQuantities);

  return { applyCartQuantities };
}
