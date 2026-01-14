const DependencyExtractionWebpackPlugin = require("@wordpress/dependency-extraction-webpack-plugin");

module.exports = [
  new DependencyExtractionWebpackPlugin({
    injectPolyfill: true,
    requestToExternal(request) {
      if (request === "@yay-bulk-order/utils") {
        return "YayBulkOrder.utils";
      }
    },
  }),

  new DependencyExtractionWebpackPlugin({
    injectPolyfill: true,
    requestToExternal(request) {
      if (request === "@yay-bulk-order/utils") {
        return "YayBulkOrder.utils";
      }
    },
    requestToExternalModule(request) {
      if (request === "@yay-bulk-order/view") {
        return true;
      }
    },
  }),
];
