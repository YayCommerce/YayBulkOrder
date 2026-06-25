import type { Meta, Settings } from '@yay-bulk-order/common/src/schemas';

/** Configuration is readonly. Store path, meta, admin settings */
export type BulkOrderConfig = {
  settings: Settings;
  wpMeta: Meta['wpMeta'];
  bulkOrderMeta: Meta['bulkOrderMeta'];
};

/** State could changed, interactive. State are shared across each page */
export type BulkOrderState = {
  noop: boolean;
};

/** Context could changed, interactive. Context is locally inside each Bulk Order Form block */
export type BulkOrderContext = {
  formAttributes: {
    queryId: number;
    forcePageReload: boolean;
  };
  queryContext: {
    page: number;
    filter: 'all' | 'in-stock' | 'on-sale';
  };
  queryResult: {
    totalLength: number;
  };
};
