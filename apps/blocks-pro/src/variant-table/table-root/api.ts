import { Meta } from '@yay-bulk-order/common/src/schemas';

declare global {
  interface Window {
    yayBulkOrderMeta: Meta;
  }
}

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

/** Searches variable products only — the Variant Table block can't do anything useful with any other product type. */
export function searchVariableProducts(search: string): Promise<ProductSearchOption[]> {
  return get(`/product-search?product_type=variable&search=${encodeURIComponent(search)}`);
}

export function fetchProductById(id: number): Promise<ProductSearchOption | undefined> {
  return get<ProductSearchOption[]>(`/product-search?include[]=${id}`).then((products) => products[0]);
}
