import { __ } from '@wordpress/i18n';

import {
  CreateShortcodeValues,
  PaginatedShortcodeListValues,
  ShortcodeFormValues,
} from '../schemas/shortcodes.schema';
import { api, handleResponse } from './base.api';

export async function getShortcodes(keyword: string, page: number, perPage: number) {
  const searchParams = new URLSearchParams({
    keyword: keyword,
    page: String(page),
    per_page: String(perPage),
  });

  const response = await api.get('shortcodes', { searchParams });
  const result = await handleResponse<PaginatedShortcodeListValues>(
    response,
    __('Failed to fetch shortcodes', 'yay-bulk-order'),
  );
  return result.data ?? {};
}

export async function getShortcode(shortcodeId: number) {
  const response = await api.get(`shortcodes/${shortcodeId}`);
  const result = await handleResponse<ShortcodeFormValues>(
    response,
    __('Failed to fetch shortcode', 'yay-bulk-order'),
  );
  return result.data;
}

export async function createShortcode(data: CreateShortcodeValues) {
  const response = await api.post('shortcodes', { json: data });
  const result = await handleResponse<ShortcodeFormValues>(
    response,
    __('Failed to create shortcode', 'yay-bulk-order'),
  );
  return result;
}

export async function updateShortcode(data: ShortcodeFormValues) {
  const response = await api.put(`shortcodes/${data.id}`, { json: data });
  const result = await handleResponse<ShortcodeFormValues>(
    response,
    __('Failed to update shortcode', 'yay-bulk-order'),
  );
  return result;
}

export async function deleteShortcodeById(shortcodeId: number) {
  const response = await api.delete(`shortcodes/${shortcodeId}`);
  const result = await handleResponse<ShortcodeFormValues>(
    response,
    __('Failed to delete shortcode', 'yay-bulk-order'),
  );
  return result;
}

export async function bulkDeleteShortcode(shortcodeIds: number[]) {
  const data = { ids: shortcodeIds };
  const response = await api.delete('shortcodes/bulk-delete', { json: data });
  const result = await handleResponse<ShortcodeFormValues>(
    response,
    __('Failed to bulk delete shortcodes', 'yay-bulk-order'),
  );
  return result;
}
