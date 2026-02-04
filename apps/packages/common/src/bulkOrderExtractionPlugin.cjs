const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

const scriptExtractionPlugin = new DependencyExtractionWebpackPlugin({
  requestToExternal(request) {
    if (request === '@yay-bulk-order/utils') {
      return ['YayBulkOrder', 'utils'];
    }
  },
});

const moduleExtractionPlugin = new DependencyExtractionWebpackPlugin({
  requestToExternal(request) {
    if (request === '@yay-bulk-order/utils') {
      return ['YayBulkOrder', 'utils'];
    }
  },
  requestToExternalModule(request) {
    if (request === '@yay-bulk-order/view') {
      return request;
    }
  },
});

module.exports = { scriptExtractionPlugin, moduleExtractionPlugin };
