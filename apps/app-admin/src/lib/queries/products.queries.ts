import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getProductsPage } from '@/lib/api/products.api';

export const PRODUCT_QUERIES = {
  all: ['products'] as const,
};

/**
 * Load every published product by walking the WooCommerce REST pagination
 * one page at a time (via `fetchNextPage`) instead of firing all pages at once.
 */
export function useAllProductsQuery() {
  const query = useInfiniteQuery({
    queryKey: PRODUCT_QUERIES.all,
    queryFn: ({ pageParam }) => getProductsPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = useMemo(() => query.data?.pages.flatMap((page) => page.products) ?? [], [query.data]);

  return { ...query, products, isLoadingAll: query.isLoading || hasNextPage };
}
