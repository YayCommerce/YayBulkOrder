import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { postSettings } from '@/lib/api/settings.api';
import type { Settings } from '@/lib/schemas/settings.schema';

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
    onSuccess: (data) => {
      window.yayBulkOrderAdminData.settings = data;
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
