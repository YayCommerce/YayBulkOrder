import { getConfig } from '@wordpress/interactivity';

import { AddToCartResponse, PurchaseListConfig, PurchaseListForm } from './purchaseList.type';

export const STORE_NAMESPACE = 'yay-bulk-order/purchase-list';

const PURCHASE_LIST_API = {
  rest: {
    create: 'purchase-list',
    update: (id: number) => `purchase-list/${id}`,
    delete: (id: number) => `purchase-list/${id}`,
  },
  ajax: {
    addToCart: 'ybo_add_purchase_list_to_cart',
  },
} as const;

let nonceCache = '';
function getStoreConfig() {
  const config = (getConfig(STORE_NAMESPACE) as PurchaseListConfig) ?? {};

  return {
    restUrl: config.path.restUrl ?? '',
    nonce: config.path.nonce ?? '',
    ajaxUrl: config.path.ajaxUrl ?? '',
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

type WpAjaxResponse<T> = { success: true; data: T } | { success: false; data?: { message?: string } };

async function storeApiAjax<T>(endpoint: string, { method = 'GET', body }: StoreApiRequestOptions = {}): Promise<T> {
  const { ajaxUrl, nonce: configNonce } = getStoreConfig();
  const requestNonce = nonceCache ? nonceCache : configNonce;

  const response = await fetch(`${ajaxUrl}?action=${endpoint}`, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(requestNonce ? { 'X-WP-Nonce': requestNonce } : {}),
    },
    body: JSON.stringify({ ...body, nonce: requestNonce }),
  });

  const nextNonce = response.headers.get('Nonce');
  if (nextNonce) {
    nonceCache = nextNonce;
  }

  const result: WpAjaxResponse<T> | undefined = await response.json().catch(() => undefined);

  if (!result || !result.success) {
    throw new Error(result?.data?.message ?? response.statusText ?? 'Store API request failed');
  }

  return result.data;
}

export async function createPurchaseList(form: PurchaseListForm) {
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

export async function updatePurchaseList(form: PurchaseListForm) {
  const products = form.products
    .filter((row) => row.productId)
    .map((row) => ({
      productId: row.productId,
      quantity: row.quantity,
    }));

  return storeApiRequest(PURCHASE_LIST_API.rest.update(form.id), {
    method: 'PUT',
    body: {
      name: form.name,
      products: products,
    },
  });
}

export async function deletePurchaseList(form: PurchaseListForm) {
  return storeApiRequest(PURCHASE_LIST_API.rest.delete(form.id), {
    method: 'DELETE',
  });
}

export async function addPurchaseListToCart(form: PurchaseListForm) {
  return storeApiAjax<AddToCartResponse>(PURCHASE_LIST_API.ajax.addToCart, {
    method: 'POST',
    body: { listId: form.id, products: form.products },
  });
}
