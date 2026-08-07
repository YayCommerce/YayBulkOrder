import type { StoreApiCart } from './type';

declare global {
  interface Window {
    wp?: {
      data?: {
        dispatch?(store: string): {
          receiveCart?(cart: StoreApiCart): void;
        };
      };
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
