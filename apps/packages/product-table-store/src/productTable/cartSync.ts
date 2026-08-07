import { getCurrentCart, watchExternalCartChanges, type StoreApiCart } from './storeApi';
import { formatCartTotal } from './storeApi/currency';

/** The slice of Product Table state that cart synchronization publishes to. */
export type CartSyncState = {
  externalCartQuantities: Record<number, number>;
  externalCartTotalFormatted: string;
  hasSyncedExternalCart: boolean;
};

export type CartSyncApi = {
  applyCartQuantities: (cart: StoreApiCart) => void;
};

/**
 * Initializes WooCommerce cart synchronization onto the given state slice:
 * publishes cart updates as they happen, and watches for cart changes
 * originating outside this module (e.g. mini-cart, other blocks).
 *
 * Returns `applyCartQuantities` so callers can also publish a cart they
 * already fetched themselves (e.g. right after a bulk add) without waiting
 * for the external-change watcher to pick it up.
 */
export function initCartSync(state: CartSyncState): CartSyncApi {
  // Publish the latest cart state.
  function applyCartQuantities(cart: StoreApiCart): void {
    const quantities: Record<number, number> = {};
    for (const item of cart.items) {
      quantities[item.id] = item.quantity;
    }
    state.externalCartQuantities = quantities;
    state.externalCartTotalFormatted = formatCartTotal(cart.totals);
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
