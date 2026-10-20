import { formatCartAmount } from '@yay-bulk-order/common/src/storeApi/currency';

// Side effect only: declares `window.wp`/`window.jQuery` — no runtime code.
import '@yay-bulk-order/common/src/storeApi/globals';

import type { StoreApiCart } from '@yay-bulk-order/common/src/storeApi/type';
import { store } from '@wordpress/interactivity';

const WC_CART_STORE = 'wc/store/cart';

const { state } = store(
  'yay-bulk-order/cart-summary',
  {
    state: {
      itemCount: 0,
      subtotal: '',

      get itemCountLabel(): string {
        return `${state.itemCount} ${state.itemCount === 1 ? 'item' : 'items'}`;
      },
      get isEmpty(): boolean {
        return state.itemCount === 0;
      },
    },
    callbacks: {
      init() {
        setupCartSyncOnce();
      },
    },
  },
  { lock: true },
);

function readCurrentCart(): StoreApiCart | undefined {
  return window.wp?.data?.select?.(WC_CART_STORE)?.getCartData?.();
}

function applyCartSnapshot(cart: StoreApiCart | undefined): void {
  if (!cart?.totals) {
    return;
  }
  state.itemCount = cart.itemsCount ?? 0;
  state.subtotal = formatCartAmount(cart.totals.total_items, cart.totals);
}

let isSetup = false;

function setupCartSyncOnce(): void {
  if (isSetup) {
    return;
  }
  isSetup = true;
  const sync = () => applyCartSnapshot(readCurrentCart());
  sync();
  window.wp?.data?.subscribe?.(sync, WC_CART_STORE);
  window.jQuery?.(document.body).on('added_to_cart removed_from_cart wc_fragment_refresh', sync);
}
