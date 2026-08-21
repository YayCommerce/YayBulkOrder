const path = require('path');

const {
  scriptExtractionPlugin,
  defaultScriptConfig,
} = require('@yay-bulk-order/common/src/config/webpackConfig.helper.cjs');

module.exports = {
  ...defaultScriptConfig,
  entry: { 'block-checkout-slotfill': path.resolve(__dirname, 'src/index.ts') },

  output: {
    ...defaultScriptConfig.output,
    filename: '[name].js',
    path: path.resolve(__dirname, '../../../assets/dist/block-checkout-slotfill'),
  },

  plugins: [
    ...defaultScriptConfig.plugins.filter((plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'),
    scriptExtractionPlugin,
  ],
};
