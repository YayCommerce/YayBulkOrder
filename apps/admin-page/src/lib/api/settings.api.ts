import { SettingsFormData } from '@/lib/schemas/settings.schema';

import { api } from './base.api';

export async function postSettings(data: SettingsFormData): Promise<SettingsFormData> {
  const response = await api.post('settings', { json: data });
  return response.json();
}
