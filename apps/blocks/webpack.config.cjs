const path = require('path');
const defaultConfigs = require('@wordpress/scripts/config/webpack.config');
const {
  scriptExtractionPlugin,
  moduleExtractionPlugin,
} = require('@yay-bulk-order/common/src/bulkOrderExtractionPlugin.cjs');

let defaultScriptConfig;
let defaultModuleConfig;
if (Array.isArray(defaultConfigs)) {
  defaultScriptConfig = defaultConfigs[0];
  defaultModuleConfig = defaultConfigs[1];
} else {
  defaultScriptConfig = defaultConfigs;
  defaultModuleConfig = defaultConfigs;
}

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
