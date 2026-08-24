import { Meta } from '@yay-bulk-order/common/src/schemas';

declare global {
  interface Window {
    yayBulkOrderMeta: Meta;
  }
}

export type ProductCategoryOption = {
  id: number;
  name: string;
  count: number;
};

export type ProductSearchOption = {
  id: number;
  name: string;
};

function getRestConfig() {
  return window.yayBulkOrderMeta.wpMeta;
}

async function get<T>(path: string): Promise<T> {
  const { restRoot, restBase, restNonce } = getRestConfig();
  const response = await fetch(`${restRoot}${restBase}${path}`, {
    headers: { 'X-WP-Nonce': restNonce },
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }

  return response.json();
}

export function fetchProductCategories(): Promise<ProductCategoryOption[]> {
  return get('/product-categories');
}

export function searchProducts(search: string): Promise<ProductSearchOption[]> {
  return get(`/product-search?search=${encodeURIComponent(search)}`);
}

export function fetchProductsByIds(ids: number[]): Promise<ProductSearchOption[]> {
  if (ids.length === 0) {
    return Promise.resolve([]);
  }

  const query = ids.map((id) => `include[]=${id}`).join('&');
  return get(`/product-search?${query}`);
}
