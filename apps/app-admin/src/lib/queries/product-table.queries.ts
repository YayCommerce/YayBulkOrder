import {
  keepPreviousData,
  queryOptions,
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import { ProductTableForm, ProductTableListParams } from '@yay-bulk-order/common/src/schemas/product-tables.schema';

import {
  applyToShopPage,
  bulkDeleteProductTable,
  createProductTable,
  deleteProductTable,
  getProductTable,
  getProductTables,
  stashNewPageBlocks,
  updateProductTable,
} from '@/lib/api/product-tables.api';

/** ─── Query Options ─────────────────────────────────── */

export const PRODUCT_TABLE_QUERIES = {
  all: ['product-tables'] as const,
  list: (filter: ProductTableListParams) =>
    queryOptions({
      queryKey: ['product-tables', filter] as const,
      queryFn: () => getProductTables(filter),
      placeholderData: keepPreviousData,
    }),
  single: (id: number) =>
    queryOptions({
      queryKey: ['product-tables', id] as const,
      queryFn: () => getProductTable(id),
      enabled: id > 0,
    }),
};

/** ─── Mutation Keys ─────────────────────────────────── */

const PRODUCT_TABLE_MUTATION_KEYS = {
  add: ['product-tables', 'add'] as const,
  update: (id: number) => ['product-tables', id, 'update'] as const,
  delete: (id: number) => ['product-tables', id, 'delete'] as const,
  bulk_delete: ['product-tables', 'bulk', 'delete'] as const,
  stash: ['product-tables', 'stash'] as const,
  apply_to_shop: ['product-tables', 'apply_to_shop'] as const,
  // For isMutating
  bulk: ['product-tables', 'bulk'] as const,
  all: ['product-tables'] as const,
};

/** Queries */

export function useProductTablesQuery(filter: ProductTableListParams) {
  return useQuery(PRODUCT_TABLE_QUERIES.list(filter));
}

export function useProductTableQuery(id: number) {
  return useQuery(PRODUCT_TABLE_QUERIES.single(id));
}

/** Mutations */

export function useCreateProductTableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PRODUCT_TABLE_MUTATION_KEYS.add,
    mutationFn: (data: ProductTableForm) => createProductTable(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCT_TABLE_QUERIES.all }),
  });
}

export function useUpdateProductTableMutation(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PRODUCT_TABLE_MUTATION_KEYS.update(id),
    mutationFn: (data: ProductTableForm) => updateProductTable(id, data),
    onSuccess: (res) => {
      queryClient.setQueryData(PRODUCT_TABLE_QUERIES.single(id).queryKey, res);
      queryClient.invalidateQueries({ queryKey: PRODUCT_TABLE_QUERIES.all });
    },
  });
}

export function useDeleteProductTableMutation(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PRODUCT_TABLE_MUTATION_KEYS.delete(id),
    mutationFn: () => deleteProductTable(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCT_TABLE_QUERIES.all }),
  });
}

export function useBulkDeleteProductTablesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PRODUCT_TABLE_MUTATION_KEYS.bulk_delete,
    mutationFn: (ids: number[]) => bulkDeleteProductTable(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCT_TABLE_QUERIES.all }),
  });
}

export function useStashNewPageBlocksMutation() {
  return useMutation({
    mutationKey: PRODUCT_TABLE_MUTATION_KEYS.stash,
    mutationFn: (content: string) => stashNewPageBlocks(content),
  });
}

export function useApplyToShopMutation() {
  return useMutation({
    mutationKey: PRODUCT_TABLE_MUTATION_KEYS.apply_to_shop,
    mutationFn: (tableId: number) => applyToShopPage(tableId),
  });
}

/** Utils */

export function useIsMutatingProductTables() {
  return useIsMutating({ mutationKey: PRODUCT_TABLE_MUTATION_KEYS.all }) > 0;
}

export function useIsMutatingBulkProductTables() {
  return useIsMutating({ mutationKey: PRODUCT_TABLE_MUTATION_KEYS.bulk }) > 0;
}

/** ─── Derived Hooks ─────────────────────────────────── */

export function useCacheProductTable() {
  const queryClient = useQueryClient();

  function cacheTable(productTable: ProductTable) {
    queryClient.setQueryData(PRODUCT_TABLE_QUERIES.single(productTable.id).queryKey, productTable);
  }

  return { cacheTable };
}
