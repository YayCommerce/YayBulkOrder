import { getConfig } from '@wordpress/interactivity';

import type { SelectedRow } from './productTable.type';

export const STORE_NAMESPACE = 'yay-bulk-order/product-table';

const STORE_API = {
  cart: {
    fetch: 'wc/store/v1/cart',
    addItem: 'wc/store/v1/cart/add-item',
    updateItem: 'wc/store/v1/cart/update-item',
    batch: 'wc/store/v1/batch',
  },
} as const;

// The Store API batch route caps the number of sub-requests per call.
const BATCH_REQUEST_LIMIT = 25;

export type StoreApiCartItem = Readonly<{
  key: string;
  id: number;
  quantity: number;
  // Present on Store API responses; e.g. "sold individually" products report
  // `editable: false` once in the cart, so their quantity can't be bumped.
  quantity_limits?: Readonly<{
    minimum: number;
    maximum: number;
    multiple_of: number;
    editable: boolean;
  }>;
}>;

export type StoreApiCartTotals = Readonly<{
  total_price?: string;
  currency_minor_unit?: number;
  currency_symbol?: string;
  currency_prefix?: string;
  currency_suffix?: string;
  currency_thousand_separator?: string;
  currency_decimal_separator?: string;
  [key: string]: unknown;
}>;

export type StoreApiCart = Readonly<{
  items: StoreApiCartItem[];
  items_count?: number;
  totals?: StoreApiCartTotals;
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
    // Localized by WooCommerce core's classic add-to-cart script, already
    // enqueued on this page; reused here instead of adding new plumbing.
    wc_add_to_cart_params?: Readonly<{ cart_url?: string }>;
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

type BatchRequestItem = {
  path: string;
  method: 'POST';
  body: Record<string, unknown>;
  headers: Record<string, string>;
};

type BatchResponse<T> = Readonly<{
  responses: ReadonlyArray<{
    status: number;
    body: T;
  }>;
}>;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function addProductsToCartBatch(items: readonly SelectedRow[]): Promise<StoreApiCart> {
  let cart = await storeApiRequest<StoreApiCart>(STORE_API.cart.fetch);

  if (!items.length) {
    return cart;
  }

  for (const group of chunk(items, BATCH_REQUEST_LIMIT)) {
    const requests: BatchRequestItem[] = [];
    const { nonce: configNonce } = getStoreConfig();
    const requestNonce = nonceCache || configNonce;
    const headers = { Nonce: requestNonce };

    for (const { productId, quantity } of group) {
      const existing = cart.items.find((item) => item.id === productId);

      if (existing && existing.quantity_limits?.editable === false) {
        continue;
      }

      requests.push(
        existing
          ? {
              path: `/${STORE_API.cart.updateItem}`,
              method: 'POST',
              headers,
              body: { key: existing.key, quantity: existing.quantity + quantity },
            }
          : {
              path: `/${STORE_API.cart.addItem}`,
              method: 'POST',
              headers,
              body: { id: productId, quantity },
            },
      );
    }

    if (!requests.length) {
      continue;
    }

    const batchResponse = await storeApiRequest<BatchResponse<StoreApiCart>>(STORE_API.cart.batch, {
      method: 'POST',
      body: { requests },
    });

    const succeeded = batchResponse.responses.filter((response) => response.status < 400);
    const failed = batchResponse.responses.filter((response) => response.status >= 400);

    if (failed.length) {
      console.error('Some items could not be added to the cart', failed);
    }

    // Only bail out if literally nothing in this batch went through;
    // partial success should still sync whatever did get added.
    if (!succeeded.length) {
      throw new Error('Bulk add to cart failed');
    }

    cart = succeeded[succeeded.length - 1].body;
  }

  return cart;
}

export function syncWooCommerceCart(cart: StoreApiCart): void {
  window.wp?.data?.dispatch?.('wc/store/cart')?.receiveCart?.(cart);
  window.jQuery?.(document.body).trigger('wc_fragment_refresh');
}

/** Formats a cart's grand total using the currency shape the Store API returns it in. */
export function formatCartTotal(totals: StoreApiCartTotals | undefined): string {
  if (!totals?.total_price) {
    return '';
  }

  const minorUnit = totals.currency_minor_unit ?? 2;
  const amount = Number(totals.total_price) / 10 ** minorUnit;
  const thousandSep = totals.currency_thousand_separator ?? ',';
  const decimalSep = totals.currency_decimal_separator ?? '.';
  const prefix = totals.currency_prefix ?? totals.currency_symbol ?? '';
  const suffix = totals.currency_suffix ?? '';

  const [intPart, decPart] = amount.toFixed(minorUnit).split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
  const formatted = decPart ? `${withThousands}${decimalSep}${decPart}` : withThousands;

  return `${prefix}${formatted}${suffix}`;
}
