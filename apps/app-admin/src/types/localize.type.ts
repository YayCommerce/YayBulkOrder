export type Meta = {
  wpMeta: {
    siteUrl: string;
    adminUrl: string;
    ajaxUrl: string;

    restRoot: string;
    restBase: string;
    restNonce: string;
  };
  bulkOrderMeta: {
    pluginUrl: string;
    assetsUrl: string;

    version: string;
    reviewed: boolean;
  };
};
