import { LocalizeData, MailersEnum, YesNoEnum } from '@/lib/schema';

declare module '*.svg' {
  const content: string;
  export default content;
}

declare global {
  interface Window {
    yayBulkOrderWpData: {
      restUrl: string;
      restNonce: string;
      restBase: string;
      YAY_BULK_ORDER_PLUGIN_PATH: string;
      YAY_BULK_ORDER_PLUGIN_URL: string;
      YAY_BULK_ORDER_SITE_URL: string;
      i18n: Record<string, string>;
      _cacheBust: number;
    } & LocalizeData;
    wp: AnyObject;
  }
}

export {};
