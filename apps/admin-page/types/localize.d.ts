import type { Settings } from '@/lib/schemas/settings.schema';

declare global {
  interface Window {
    yayBulkOrderAdminData: {
      metadata: {
        isBlockTheme: boolean;
      };
      path: {
        assetsUrl: string;
        restUrl: string;
        nonce: string;
      };
      settings: Settings;
    };
  }
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
    isCheckbox?: boolean;
  }
}

export {};
