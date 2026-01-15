import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getShortcodes } from '@/lib/api/shortcodes.api';

export function useShortcodesQuery(
  keyword: string,
  pagination: {
    pageIndex: number;
    pageSize: number;
  },
) {
  return useQuery({
    queryKey: ['shortcodes', { keyword, pagination }],
    queryFn: async () => {
      return getShortcodes(keyword, pagination.pageIndex + 1, pagination.pageSize);
    },
    placeholderData: keepPreviousData,
  });
}
