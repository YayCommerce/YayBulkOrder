import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Settings } from '@yay-bulk-order/common/types/settings.schema';
import { postSettings } from '@/lib/api/settings.api';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => window.yayBulkOrderAdminData.settings,
  });
}

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['settings'],
    mutationFn: async (data: Settings) => postSettings(data),
    onSuccess: (res, data) => {
      window.yayBulkOrderAdminData.settings = data;
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
