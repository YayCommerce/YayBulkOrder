import { PaginatedShortcodeListValues } from '../schemas/shortcodes.schema';
import { api } from './base.api';

export async function getShortcodes(
  keyword: string,
  page: number,
  perPage: number,
): Promise<PaginatedShortcodeListValues> {
  const searchParams = new URLSearchParams({
    keyword: keyword,
    page: String(page),
    per_page: String(perPage),
  });

  const response = await api.get('shortcodes', { searchParams });
  return response.json();
}
