const path = require('path');

const {
  moduleExtractionPlugin,
  scriptExtractionPlugin,
  defaultScriptConfig,
  defaultModuleConfig,
} = require('@yay-bulk-order/common//config/webpackConfig.helper.cjs');

const extendedScriptConfig = {
  ...defaultScriptConfig,

  output: {
    ...defaultScriptConfig.output,
    path: path.resolve(__dirname, '../../assets/dist/blocks'),
  },

  plugins: [
    ...defaultScriptConfig.plugins.filter((plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'),
    scriptExtractionPlugin,
  ],
};

const extendedModuleConfig = {
  ...defaultModuleConfig,

  output: {
    ...defaultModuleConfig.output,
    path: path.resolve(__dirname, '../../assets/dist/blocks'),
  },

  plugins: [
    ...defaultModuleConfig.plugins.filter((plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'),
    moduleExtractionPlugin,
  ],
};

module.exports = [extendedScriptConfig, extendedModuleConfig];
