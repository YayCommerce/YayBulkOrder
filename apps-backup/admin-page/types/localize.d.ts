import type { BulkOrderConfig } from '@yay-bulk-order/common/types/bulkOrder.type';

declare global {
  interface Window {
    yayBulkOrderAdminData: BulkOrderConfig;
  }
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
    isCheckbox?: boolean;
  }
}

export {};
