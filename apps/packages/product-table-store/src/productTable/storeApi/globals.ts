import type { StoreApiCart } from './type';

/** Minimal shape of the `@wordpress/data` registry this package reads off `window.wp.data`. */
type WpDataRegistry = {
  select?(store: string): { getCartData?(): StoreApiCart } | undefined;
  subscribe?(listener: () => void, storeNameOrDescriptor?: string): () => void;
  dispatch?(store: string): {
    receiveCart?(cart: StoreApiCart): void;
  };
};

declare global {
  interface Window {
    wp?: {
      data?: WpDataRegistry;
    };
    jQuery?: (element: HTMLElement | Document) => {
      trigger(event: string): void;
      on(event: string, handler: () => void): void;
    };
    // Localized by WooCommerce core's classic add-to-cart script, already
    // enqueued on this page; reused here instead of adding new plumbing.
    wc_add_to_cart_params?: Readonly<{ cart_url?: string }>;
  }
}

export {};
