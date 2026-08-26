import './globals';

import { getConfig } from '@wordpress/interactivity';

import type { SelectedRow } from '../productTable.type';
import type {
  BatchRequestItem,
  BatchResponse,
  StoreApiCart,
  StoreApiRequestOptions,
  StoreApiVariationSelection,
  StoreConfig,
} from './type';

export type { StoreApiCart, StoreApiCartItem, StoreApiCartTotals } from './type';

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

// Fetch the current cart.
export async function getCurrentCart(): Promise<StoreApiCart> {
  return storeApiRequest<StoreApiCart>(STORE_API.cart.fetch);
}

export async function addProductToCart(
  productId: number,
  quantityToAdd: number,
  variation?: readonly StoreApiVariationSelection[],
): Promise<StoreApiCart> {
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
      // "Any"-valued variation attributes (e.g. Any Size) need an explicit value;
      // the row context supplies one resolved to the attribute's first option.
      ...(variation?.length ? { variation } : {}),
    },
  });
}

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

    for (const { productId, quantity, variationSelections } of group) {
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
              body: { id: productId, quantity, ...(variationSelections?.length ? { variation: variationSelections } : {}) },
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

// Prevent reacting to cart updates triggered by this module.
let isApplyingOwnCartSync = false;

// Sync the Store API cart with WooCommerce Blocks,
export function syncWooCommerceCart(cart: StoreApiCart): void {
  isApplyingOwnCartSync = true;
  try {
    window.wp?.data?.dispatch?.('wc/store/cart')?.receiveCart?.(cart);
  } finally {
    isApplyingOwnCartSync = false;
  }
  // Refresh classic cart fragments.
  window.jQuery?.(document.body).trigger('wc_fragment_refresh');
}

/** A cheap fingerprint of the cart's contents, used to tell an actual change apart from a no-op notification. */
function getCartItemsSignature(): string | undefined {
  const items = window.wp?.data?.select?.('wc/store/cart')?.getCartData?.()?.items;

  if (!items) {
    return undefined;
  }

  return items
    .map((item) => `${item.id}:${item.quantity}`)
    .sort()
    .join(',');
}

// Ignore initial store activity.
const EXTERNAL_CHANGE_SETTLE_MS = 1500;
// Debounce external cart updates.
const EXTERNAL_CHANGE_DEBOUNCE_MS = 300;

/**
 * Notifies when the WooCommerce cart changes externally.
 */
export function watchExternalCartChanges(onExternalCartChange: () => void): void {
  const watchStartedAt = Date.now();
  // Ignore the initial store state.
  let lastCartSignature = getCartItemsSignature();
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const notify = () => {
    if (isApplyingOwnCartSync) {
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onExternalCartChange, EXTERNAL_CHANGE_DEBOUNCE_MS);
  };

  window.jQuery?.(document.body).on('removed_from_cart', notify);

  // Watch Store API cart changes.
  window.wp?.data?.subscribe?.(() => {
    const signature = getCartItemsSignature();
    const isStillSettling = Date.now() - watchStartedAt < EXTERNAL_CHANGE_SETTLE_MS;
    const hasChanged = lastCartSignature !== undefined && signature !== lastCartSignature;
    lastCartSignature = signature;

    if (hasChanged && !isStillSettling) {
      notify();
    }
  }, 'wc/store/cart');
}
