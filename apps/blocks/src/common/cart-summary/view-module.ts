import { formatCartAmount } from '@yay-bulk-order/product-table-store/src/productTable/storeApi/currency';

// Side effect only: declares `window.wp`/`window.jQuery` — no runtime code.
import '@yay-bulk-order/product-table-store/src/productTable/storeApi/globals';

import type { StoreApiCart } from '@yay-bulk-order/product-table-store/src/productTable/storeApi/type';
import { getContext, store } from '@wordpress/interactivity';

export type CartSummaryContext = {
  isOpen: boolean;
  itemCount: number;
  subtotal: string;
};

function readCurrentCart(): StoreApiCart | undefined {
  return window.wp?.data?.select?.('wc/store/cart')?.getCartData?.();
}

/** Applies a cart snapshot onto this instance's context. */
function applyCart(context: CartSummaryContext, cart: StoreApiCart | undefined): void {
  if (!cart?.totals) {
    return;
  }
  context.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
  context.subtotal = formatCartAmount(cart.totals.total_items, cart.totals);
}

const storeDef = {
  state: {
    get buttonText(): string {
      const context = getContext<CartSummaryContext>();
      return context.isOpen ? 'Close Cart' : 'Open Cart';
    },
    get itemCountLabel(): string {
      const { itemCount } = getContext<CartSummaryContext>();
      return `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
    },
    get isEmpty(): boolean {
      const { itemCount } = getContext<CartSummaryContext>();
      return itemCount === 0;
    },
    get subtotal(): string {
      const context = getContext<CartSummaryContext>();
      return context.subtotal ?? '';
    },
  },
  actions: {
    openMiniCart() {
      const context = getContext<CartSummaryContext>();
      context.isOpen = true;

      document
        .querySelector<HTMLElement>('.wc-block-mini-cart__button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    },
  },
  callbacks: {
    init() {
      const context = getContext<CartSummaryContext>();
      const sync = () => applyCart(context, readCurrentCart());

      sync();

      window.wp?.data?.subscribe?.(sync);
      window.jQuery?.(document.body).on('added_to_cart removed_from_cart wc_fragment_refresh', sync);
    },
  },
};

store('yay-bulk-order/cart-summary', storeDef, { lock: true });
