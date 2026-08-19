import { getConfig } from '@wordpress/interactivity';

import { FormState, PurchaseListConfig } from './purchaseList.type';

export const STORE_NAMESPACE = 'yay-bulk-order/purchase-list';

const PURCHASE_LIST_API = {
  rest: {
    create: 'purchase-list',
    update: 'purchase-list',
    delete: 'purchase-list',
  },
} as const;

let nonceCache = '';
function getStoreConfig() {
  const config = (getConfig(STORE_NAMESPACE) as PurchaseListConfig) ?? {};

  return {
    restUrl: config.path.restUrl ?? '',
    nonce: config.path.nonce ?? '',
  };
}

type StoreApiRequestOptions = {
  method?: RequestInit['method'];
  body?: Record<string, unknown>;
};

async function storeApiRequest<T>(endpoint: string, { method = 'GET', body }: StoreApiRequestOptions = {}): Promise<T> {
  const { restUrl, nonce: configNonce } = getStoreConfig();
  const requestNonce = nonceCache ? nonceCache : configNonce;

  const response = await fetch(`${restUrl}/${endpoint}`, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(requestNonce ? { 'X-WP-Nonce': requestNonce } : {}),
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

export async function createPurchaseList(form: FormState) {
  const products = form.products
    .filter((row) => row.productId)
    .map((row) => ({
      productId: row.productId,
      quantity: row.quantity,
    }));

  return storeApiRequest(PURCHASE_LIST_API.rest.create, {
    method: 'POST',
    body: {
      name: form.name,
      products: products,
    },
  });
}
