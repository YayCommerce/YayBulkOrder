import type { Settings } from '@yay-bulk-order/common/types/settings.type';

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

export {};
