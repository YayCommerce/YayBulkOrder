import { getConfig } from '@wordpress/interactivity';

import type { BulkOrderConfig } from '@yay-bulk-order/common/types/bulkOrder.type';

export function checkViewIsReady() {
  console.log('checkViewIsReady');
}

export function getBulkOrderConfig() {
  return getConfig('yay-bulk-order/bulk-order-form') as BulkOrderConfig;
}
