import { Settings } from '@yay-bulk-order/common/src/schemas';

import { api } from '@/lib/api/api';

export function getSettings() {
  return api.get('settings').json<Settings>();
}

export function saveSettings(data: Settings) {
  return api.post('settings', { json: data }).json<Settings>();
}

export function markReviewed() {
  return api.post('mark-reviewed').json<boolean>();
}
