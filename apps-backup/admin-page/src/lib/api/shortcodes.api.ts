import { ShortcodeConfig, ShortcodeConfigFormValues } from '../schemas/shortcodes.schema';
import { PaginatedResponse } from './apiUtils';
import { api } from './base.api';

export async function getShortcodes(
  keyword: string,
  page: number,
  perPage: number,
): Promise<PaginatedResponse<ShortcodeConfig>> {
  const searchParams = new URLSearchParams({
    keyword: keyword,
    page: String(page),
    per_page: String(perPage),
  });

  const response = await api.get('shortcodes', { searchParams });
  return response.json();
}

export async function getShortcode(shortcodeId: number): Promise<ShortcodeConfig> {
  const response = await api.get(`shortcodes/${shortcodeId}`);
  return response.json();
}

export async function createShortcode(data: ShortcodeConfigFormValues): Promise<ShortcodeConfig> {
  const response = await api.post('shortcodes', { json: data });
  return response.json();
}

export async function updateShortcode(
  id: number,
  data: ShortcodeConfigFormValues,
): Promise<ShortcodeConfig> {
  const response = await api.put(`shortcodes/${id}`, { json: data });
  return response.json();
}

export async function deleteShortcodeById(shortcodeId: number) {
  const response = await api.delete(`shortcodes/${shortcodeId}`);
  return response.json();
}

export async function bulkDeleteShortcode(shortcodeIds: number[]) {
  const data = { ids: shortcodeIds };
  const response = await api.delete('shortcodes/bulk-delete', { json: data });
  return response.json();
}
