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
      settings: {
        general: {
          defaultCartQuantity: number;
        };
        colors: {
          primary: string;
          text: string;
          background: string;
        };
        styles: {
          borderRadius: 'small' | 'medium' | 'large';
        };
      };
    };
  }
}

export {};
