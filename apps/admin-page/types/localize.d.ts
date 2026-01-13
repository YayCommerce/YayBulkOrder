declare global {
  interface Window {
    yayBulkOrderData: {
      assetsUrl: string;
      restUrl: string;
      nonce: string;
    };
  }
}

export {};
