import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { toast } from 'sonner';

import { postSettings } from '@/lib/api/settings.api';
import type { SettingsFormData } from '@/lib/schemas/settings.schema';

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings'],
    mutationFn: async (data: SettingsFormData) => postSettings(data),
    onSuccess: () => {
      toast.success(__('Settings saved!', 'yay-bulk-order'));
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => {
      toast.error(__('Oops! Something went wrong!', 'yay-bulk-order'));
    },
  });
}
