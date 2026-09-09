import { Settings } from './settings.schema';

export type AdminData = {
  settings: Settings;
  defaultPresets: {
    tableColors: Settings['colors'];
  };
};

/**
 * Read live from WooCommerce on every request (see `LocalizeService::get_global_config()`),
 * not persisted into `Settings` — a saved settings option must never bake in a stale currency.
 */
export type Currency = {
  symbol: string;
  position: 'left' | 'left_space' | 'right' | 'right_space';
  decimals: number;
  decimalSep: string;
  thousandSep: string;
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
    /** Active theme stylesheet slug (`get_stylesheet()`), used to build Site Editor template ids. */
    themeSlug: string;
  };
  bulkOrderMeta: {
    pluginUrl: string;
    assetsUrl: string;

    version: string;
    reviewed: boolean;
    isPro: boolean;
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
