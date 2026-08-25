import { getConfig } from '@wordpress/interactivity';

export const STORE_NAMESPACE = 'yay-bulk-order/product-table';

const STORE_API = {
  cart: {
    fetch: 'wc/store/v1/cart',
    addItem: 'wc/store/v1/cart/add-item',
    updateItem: 'wc/store/v1/cart/update-item',
  },
} as const;

export type StoreApiCartItem = Readonly<{
  key: string;
  id: number;
  quantity: number;
}>;

export type StoreApiCart = Readonly<{
  items: StoreApiCartItem[];
  items_count?: number;
  totals?: Record<string, string>;
}>;

type StoreConfig = {
  restUrl: string;
  nonce: string;
};

type StoreApiRequestOptions = {
  method?: RequestInit['method'];
  body?: Record<string, unknown>;
};

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
    };
  }
}

// Cache only the nonce. The config is read on every request.
let nonceCache = '';

function getStoreConfig(): StoreConfig {
  const config = getConfig(STORE_NAMESPACE) ?? {};

  return {
    restUrl: config.restUrl ?? '',
    nonce: config.nonce ?? '',
  };
}

async function storeApiRequest<T>(endpoint: string, { method = 'GET', body }: StoreApiRequestOptions = {}): Promise<T> {
  const { restUrl, nonce: configNonce } = getStoreConfig();
  const requestNonce = nonceCache || configNonce;

  const response = await fetch(`${restUrl}${endpoint}`, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(requestNonce ? { Nonce: requestNonce } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const nextNonce = response.headers.get('Nonce');
  if (nextNonce) {
    nonceCache = nextNonce;
  }

  const data: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new Error(
      (data as { message?: string } | undefined)?.message ?? response.statusText ?? 'Store API request failed',
    );
  }

  return data as T;
}

export async function addProductToCart(productId: number, quantityToAdd: number): Promise<StoreApiCart> {
  const cart = await storeApiRequest<StoreApiCart>(STORE_API.cart.fetch);

  const existing = cart.items.find((item) => item.id === productId);

  if (existing) {
    return storeApiRequest<StoreApiCart>(STORE_API.cart.updateItem, {
      method: 'POST',
      body: {
        key: existing.key,
        quantity: existing.quantity + quantityToAdd,
      },
    });
  }

  return storeApiRequest<StoreApiCart>(STORE_API.cart.addItem, {
    method: 'POST',
    body: {
      id: productId,
      quantity: quantityToAdd,
    },
  });
}

export function syncWooCommerceCart(cart: StoreApiCart): void {
  window.wp?.data?.dispatch?.('wc/store/cart')?.receiveCart?.(cart);
  window.jQuery?.(document.body).trigger('wc_fragment_refresh');
}
