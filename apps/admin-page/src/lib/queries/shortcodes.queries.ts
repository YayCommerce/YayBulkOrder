import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import {
  bulkDeleteShortcode,
  createShortcode,
  deleteShortcodeById,
  getShortcode,
  getShortcodes,
  updateShortcode,
} from '@/lib/api/shortcodes.api';
import { toast } from '@/components/ui/sonner';

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

export function useShortcodeQuery(shortcodeId: number) {
  return useQuery({
    queryKey: ['shortcode', shortcodeId],
    queryFn: async () => {
      return getShortcode(shortcodeId);
    },
    enabled: !!shortcodeId,
  });
}

export function useCreateShortcodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createShortcode'],
    mutationFn: createShortcode,
    onSuccess: () => {
      toast.success(__('Shortcode created!', 'yay-bulk-order'));
      queryClient.invalidateQueries({ queryKey: ['shortcodes'] });
    },
    onError: () => {
      toast.error(__('Oops! Something went wrong!', 'yay-bulk-order'));
    },
  });
}

export function useUpdateShortcodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateShortcode'],
    mutationFn: updateShortcode,
    onSuccess: () => {
      toast.success(__('Shortcode updated!', 'yay-bulk-order'));
      queryClient.invalidateQueries({ queryKey: ['shortcodes'] });
    },
    onError: () => {
      toast.error(__('Oops! Something went wrong!', 'yay-bulk-order'));
    },
  });
}

export function useDeleteShortcodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['shortcode', 'delete'],
    mutationFn: (shortcodeId: number) => deleteShortcodeById(shortcodeId),

    onSuccess: (response, shortcodeId) => {
      toast.success(response.message);

      queryClient.invalidateQueries({ queryKey: ['shortcode', shortcodeId] });
      queryClient.invalidateQueries({ queryKey: ['shortcodes'] });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteShortcodeMutation(ids: number[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['shortcodes', 'bulk-delete'],
    mutationFn: () => bulkDeleteShortcode(ids),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['shortcodes'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
