import type { Settings } from '@yay-bulk-order/common/types/settings.schema';
import { api } from './base.api';

export async function postSettings(data: Settings): Promise<boolean> {
  const response = await api.post('settings', { json: data });
  return response.json();
}
