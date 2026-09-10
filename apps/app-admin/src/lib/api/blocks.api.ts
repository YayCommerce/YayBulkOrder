import { WpPattern } from '@yay-bulk-order/common/src/schemas';

import { wordpressApi } from '@/lib/api/api';

const { patternCategoryId } = window.yayBulkOrderMeta.wpMeta;

export function createPattern(title: string, content: string, tableId?: number) {
  return wordpressApi
    .post('blocks', {
      json: {
        tableId: tableId ?? 0,
        title,
        content,
        status: 'publish',
        wp_pattern_sync_status: 'unsynced',
        wp_pattern_category: [patternCategoryId],
      },
    })
    .json<WpPattern>();
}
