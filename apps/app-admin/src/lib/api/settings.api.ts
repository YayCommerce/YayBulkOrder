import { api } from '@/lib/api/api';

export function markReviewed() {
  return api.post('mark-reviewed').json<boolean>();
}
