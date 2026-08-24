import { Settings } from './settings.schema';

export type AdminData = {
  settings: Settings;
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
};
