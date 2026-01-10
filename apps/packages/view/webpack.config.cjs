const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

module.exports = {
  ...defaultConfig,
  experiments: { outputModule: true },
  entry: { 'bulk-order-view': path.resolve(__dirname, 'src/view.index.ts') },

  output: {
    ...defaultConfig.output,
    filename: '[name].js',
    library: { type: 'module' },
    path: path.resolve(__dirname, '../../assets/dist/view'),
    module: true,
  },

  plugins: [
    ...defaultConfig.plugins.filter(
      (plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin',
    ),
    new DependencyExtractionWebpackPlugin({
      injectPolyfill: true,
      requestToExternal(request) {
        if (request === '@bulk-order/utils') {
          return 'YayBulkOrder.utils';
        }
      },
    }),
  ],
};
