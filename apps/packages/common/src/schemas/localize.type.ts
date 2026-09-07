import { Settings } from './settings.schema';

export type AdminData = {
  settings: Settings;
  defaultPresets: {
    tableColors: Settings['colors'];
  };
};

export type Meta = {
  wpMeta: {
    siteUrl: string;
    adminUrl: string;
    ajaxUrl: string;

    restRoot: string;
    restBase: string;
    restNonce: string;

    isBlockTheme: boolean;
    /** WooCommerce Shop page ID (`wc_get_page_id( 'shop' )`), 0 if unset. */
    shopPageId: number;
  };
  bulkOrderMeta: {
    pluginUrl: string;
    assetsUrl: string;

    version: string;
    reviewed: boolean;
  };
  wcMeta: {
    currency_data: {
      currency: string;
      symbol: string;
      position: string;
      thousand_sep: string;
      decimal_sep: string;
      num_decimals: number;
    };
    categories: Array<{
      id: number;
      title: string;
    }>;
  };
};
