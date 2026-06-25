import { getConfig } from '@wordpress/interactivity';

import { BulkOrderConfig } from './bulkOrder.type';

export function getBulkOrderConfig() {
  return getConfig('yay-bulk-order/bulk-order-form') as BulkOrderConfig;
}
