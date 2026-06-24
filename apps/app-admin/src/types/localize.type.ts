export type Meta = {
  wpMeta: {
    siteUrl: string;
    adminUrl: string;
    ajaxUrl: string;

    restRoot: string;
    restBase: string;
    restNonce: string;

    usersUrl: {
      list: string;
      new: string;
      edit: string;
    };
  };
  bulkOrderMeta: {
    pluginUrl: string;
    assetsUrl: string;

    version: string;
    reviewed: boolean;
  };
};
