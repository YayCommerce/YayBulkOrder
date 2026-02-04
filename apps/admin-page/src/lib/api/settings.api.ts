import { Settings } from '@/lib/schemas/settings.schema';
import { api } from './base.api';

export async function postSettings(data: Settings): Promise<boolean> {
  const response = await api.post('settings', { json: data });
  return response.json();
}
