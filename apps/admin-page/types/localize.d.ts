import type { SettingsFormData } from '@/lib/schemas/settings.schema';

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
      settings: SettingsFormData;
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
