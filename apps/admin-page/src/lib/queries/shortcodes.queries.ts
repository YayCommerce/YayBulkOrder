import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  bulkDeleteShortcode,
  createShortcode,
  deleteShortcodeById,
  getShortcode,
  getShortcodes,
  updateShortcode,
} from '@/lib/api/shortcodes.api';
import { toast } from '@/components/ui/sonner';
import { ShortcodeConfigFormValues } from '../schemas/shortcodes.schema';

export function useShortcodesQuery(
  keyword: string,
  pagination: {
    pageIndex: number;
    pageSize: number;
  },
) {
  return useQuery({
    queryKey: ['shortcodes', { keyword, pagination }],
    queryFn: () => getShortcodes(keyword, pagination.pageIndex + 1, pagination.pageSize),
    placeholderData: keepPreviousData,
  });
}

export function useShortcodeQuery(shortcodeId: number) {
  return useQuery({
    queryKey: ['shortcode', shortcodeId],
    queryFn: () => getShortcode(shortcodeId),
    enabled: !!shortcodeId,
  });
}

export function useCreateShortcodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['shortcodes', 'create'],
    mutationFn: createShortcode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortcodes'] });
    },
  });
}

export function useUpdateShortcodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['shortcodes', 'update'],
    mutationFn: ({
      shortcodeId,
      payload,
    }: {
      shortcodeId: number;
      payload: ShortcodeConfigFormValues;
    }) => updateShortcode(shortcodeId, payload),
    onSuccess: (_, { shortcodeId }) => {
      queryClient.invalidateQueries({ queryKey: ['shortcodes'] });
      queryClient.invalidateQueries({ queryKey: ['shortcode', shortcodeId] });
    },
  });
}

export function useDeleteShortcodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['shortcodes', 'delete'],
    mutationFn: (shortcodeId: number) => deleteShortcodeById(shortcodeId),
    onSuccess: (_, shortcodeId) => {
      queryClient.invalidateQueries({ queryKey: ['shortcodes'] });
      queryClient.invalidateQueries({ queryKey: ['shortcode', shortcodeId] });
    },
  });
}

export function useBulkDeleteShortcodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['shortcodes', 'bulk-delete'],
    mutationFn: (ids: number[]) => bulkDeleteShortcode(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortcodes'] });
      queryClient.invalidateQueries({ queryKey: ['shortcode'] });
    },
  });
}
