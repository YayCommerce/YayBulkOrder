import { queryOptions, useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSettings, saveSettings } from '@/lib/api/settings.api';

/** Options */

export const SETTINGS_QUERIES = {
  main: queryOptions({
    queryKey: ['settings', 'main'],
    queryFn: async () => {
      const res = await getSettings();
      window.yayBulkOrderAdminData.settings = res;
      return res;
    },
    initialData: window.yayBulkOrderAdminData.settings,
    staleTime: Infinity,
  }),
};

/** Queries */

export function useSettingsQuery() {
  return useQuery(SETTINGS_QUERIES.main);
}

/** Mutations */

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings'],
    mutationFn: saveSettings,
    onSuccess: (res) => {
      window.yayBulkOrderAdminData.settings = res;
      queryClient.setQueryData(SETTINGS_QUERIES.main.queryKey, res);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERIES.main.queryKey }),
  });
}

/** Utils */

export function useIsMutatingSettings() {
  return useIsMutating({ mutationKey: ['settings'] });
}
