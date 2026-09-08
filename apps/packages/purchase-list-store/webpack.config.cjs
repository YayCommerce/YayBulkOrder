const path = require('path');

const {
  moduleExtractionPlugin,
  defaultModuleConfig,
} = require('@yay-bulk-order/common/src/config/webpackConfig.helper.cjs');

module.exports = {
  ...defaultModuleConfig,
  entry: { 'purchase-list-store': path.resolve(__dirname, 'src/purchase-list-store.index.ts') },

  output: {
    ...defaultModuleConfig.output,
    filename: '[name].js',
    path: path.resolve(__dirname, '../../../assets/dist/purchase-list-store'),
  },

  plugins: [
    ...defaultModuleConfig.plugins.filter((plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'),
    moduleExtractionPlugin,
  ],
};
