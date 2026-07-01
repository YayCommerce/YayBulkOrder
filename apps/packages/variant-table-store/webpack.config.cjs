const path = require('path');

const {
  moduleExtractionPlugin,
  defaultModuleConfig,
} = require('@yay-bulk-order/common//config/webpackConfig.helper.cjs');

module.exports = {
  ...defaultModuleConfig,
  entry: { 'variant-table-store': path.resolve(__dirname, 'src/variant-table-store.index.ts') },

  output: {
    ...defaultModuleConfig.output,
    filename: '[name].js',
    path: path.resolve(__dirname, '../../../assets/dist/variant-table-store'),
  },

  plugins: [
    ...defaultModuleConfig.plugins.filter((plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'),
    moduleExtractionPlugin,
  ],
};
