const path = require('path');

const {
  moduleExtractionPlugin,
  defaultModuleConfig,
} = require('@yay-bulk-order/common//config/webpackConfig.helper.cjs');

module.exports = {
  ...defaultModuleConfig,
  entry: { 'product-table-store': path.resolve(__dirname, 'src/product-table-store.index.ts') },

  output: {
    ...defaultModuleConfig.output,
    filename: '[name].js',
    path: path.resolve(__dirname, '../../../assets/dist/product-table-store'),
  },

  plugins: [
    ...defaultModuleConfig.plugins.filter((plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'),
    moduleExtractionPlugin,
  ],
};
