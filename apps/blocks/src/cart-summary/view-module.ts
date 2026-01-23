import { getContext, store } from '@wordpress/interactivity';

interface CartItem {
  key: string;
  productId: number;
  variationId: number;
  quantity: number;
  name: string;
  price: string;
  lineTotal: string;
  thumbnail: string;
}

interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

interface CartData {
  items: CartItem[];
  totals: CartTotals;
  hasShipping: boolean;
  hasTax: boolean;
  hasDiscount: boolean;
  itemCount: number;
  cartUrl: string;
  checkoutUrl: string;
}

type Context = {
  cart: CartData;
  isLoading: boolean;
};

interface Window {
  wc_cart_params?: {
    ajax_url?: string;
  };
  wc_cart_fragments_params?: {
    wc_ajax_url?: string;
  };

  // Narrow jQuery typing to avoid global type dependency.
  // We only use the parts we need (body selection and 'on'/'off' methods).
  jQuery?: {
    (selector: Document | HTMLElement): {
      on: (events: string, handler: (this: Document, event: unknown) => void) => void;
      off: (events: string, handler: (this: Document, event: unknown) => void) => void;
    };
  };
}

const storeDef = {
  state: {
    get isEmpty(): boolean {
      const context = getContext<Context>();
      return context.cart.itemCount === 0;
    },
    get removeButtonText(): string {
      const context = getContext<Context>();
      return context.isLoading ? 'Removing...' : 'Remove';
    },
  },
  actions: {
    *removeItem(event: Event) {
      event.preventDefault();

      const context = getContext<Context>();
      const target = event.currentTarget as HTMLElement;
      const cartKey = target.dataset.cartKey;

      if (!cartKey || context.isLoading) return;

      const win = typeof window !== 'undefined' ? (window as Window) : undefined;
      const wcAjaxUrl = win?.wc_cart_fragments_params?.wc_ajax_url;

      if (!wcAjaxUrl) {
        console.error('wc_ajax_url not found');
        return;
      }

      const url = wcAjaxUrl.replace('%%endpoint%%', 'remove_from_cart');

      context.isLoading = true;

      try {
        const formData = new FormData();
        formData.append('cart_item_key', cartKey);

        yield fetch(url, {
          method: 'POST',
          body: formData,
          credentials: 'same-origin',
        });

        document.body.dispatchEvent(new Event('wc_fragment_refresh'));
      } finally {
        context.isLoading = false;
      }
    },
  },
  callbacks: {
    onInit() {
      const context = getContext<Context>();
      console.log('Cart Summary initialized', context.cart);

      // Listen for cart update events
      const handleCartUpdate = () => {
        console.log('Cart updated, refreshing...');
        // Refresh cart data by reloading the page
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      };

      // Listen to custom cart update event
      document.addEventListener('yay-bulk-order-cart-updated', handleCartUpdate);

      // Listen to WooCommerce cart update events
      if (typeof window !== 'undefined' && (window as Window).jQuery) {
        const $body = (window as Window).jQuery(document.body);
        $body.on('added_to_cart removed_from_cart updated_cart_totals', handleCartUpdate);
        $body.on('wc_fragment_refresh', handleCartUpdate);
      }
    },
  },
};

store('yay-bulk-order/cart-summary', storeDef, { lock: true });
