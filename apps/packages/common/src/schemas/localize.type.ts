import { Settings } from './settings.schema';

export type AdminData = {
  settings: Settings;
  defaultPresets: {
    tableColors: Settings['colors'];
  };
  /**
   * `wp_localize_script()` stringifies every top-level scalar, so this is
   * actually a numeric string (e.g. `"123"`) at runtime — `Number(...)` it
   * before comparing against a real number.
   */
  shopTableId: number;
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
    /** WooCommerce Shop page URL (`wc_get_page_permalink( 'shop' )`), empty string if unset. */
    shopPageUrl: string;
    /** Active theme stylesheet slug (`get_stylesheet()`), used to build Site Editor template ids. */
    themeSlug: string;
    /** `wp_pattern_category` term id user-created patterns are filed under, 0 if unavailable. */
    patternCategoryId: number;
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
