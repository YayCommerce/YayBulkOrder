const path = require('path');
const [, defaultModuleConfig] = require('@wordpress/scripts/config/webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

const globalModules = [
  ['@yay-bulk-order/utils', ['YayBulkOrder', 'utils']],
];
const esModules = ['@yay-bulk-order/store'];

const moduleExtractionPlugin = new DependencyExtractionWebpackPlugin({
  requestToExternal(request) {
    globalModules.forEach(([packageName, resolvedModule]) => {
      if (request === packageName) {
        return resolvedModule;
      }
    });
  },
  requestToExternalModule(request) {
    esModules.forEach(([packageName]) => {
      if (request === packageName) {
        return request;
      }
    });
  },
});

module.exports = {
  ...defaultModuleConfig,
  entry: { 'bulk-order-store': path.resolve(__dirname, 'src/store.index.ts') },

  output: {
    ...defaultModuleConfig.output,
    filename: '[name].js',
    path: path.resolve(__dirname, '../../../assets/dist/store'),
  },

  plugins: [
    ...defaultModuleConfig.plugins.filter((plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'),
    moduleExtractionPlugin,
  ],
};
