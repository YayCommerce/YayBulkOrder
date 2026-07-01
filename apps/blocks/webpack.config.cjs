const path = require('path');

const {
  moduleExtractionPlugin,
  scriptExtractionPlugin,
  defaultScriptConfig,
  defaultModuleConfig,
} = require('@yay-bulk-order/common/src/config/webpackConfig.helper.cjs');

const extendedScriptConfig = {
  ...defaultScriptConfig,

  plugins: [
    ...defaultScriptConfig.plugins.filter((plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'),
    scriptExtractionPlugin,
  ],
};

const extendedModuleConfig = {
  ...defaultModuleConfig,

  plugins: [
    ...defaultModuleConfig.plugins.filter((plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'),
    moduleExtractionPlugin,
  ],
};

module.exports = [extendedScriptConfig, extendedModuleConfig];
