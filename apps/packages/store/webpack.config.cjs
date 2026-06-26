const path = require('path');

const {
  moduleExtractionPlugin,
  defaultModuleConfig,
} = require('@yay-bulk-order/common//config/webpackConfig.helper.cjs');

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
