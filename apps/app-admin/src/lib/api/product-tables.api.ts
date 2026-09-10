import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import {
  PaginatedProductTables,
  ProductTableForm,
  ProductTableListParams,
} from '@yay-bulk-order/common/src/schemas/product-tables.schema';

import { api } from '@/lib/api/api';

export function getProductTables(filter: ProductTableListParams) {
  const searchParams = new URLSearchParams({
    page: String(filter.page),
    perPage: String(filter.perPage),
    search: filter.search,
    productsDisplay: filter.productsDisplay,
  });
  return api
    .get('product-tables', {
      searchParams,
    })
    .json<PaginatedProductTables>();
}

export function getProductTable(id: number) {
  return api.get(`product-tables/${id}`).json<ProductTable>();
}

export function createProductTable(data: ProductTableForm) {
  return api.post('product-tables', { json: data }).json<ProductTable>();
}

export function updateProductTable(id: number, data: ProductTableForm) {
  return api.put(`product-tables/${id}`, { json: data }).json<ProductTable>();
}

export function deleteProductTable(id: number) {
  return api.delete(`product-tables/${id}`).json<boolean>();
}

export function bulkDeleteProductTable(ids: number[]) {
  return api.delete('product-tables/bulk-delete', { json: { tableIds: ids } }).json<number>();
}
