const {
  moduleExtractionPlugin,
  scriptExtractionPlugin,
  defaultScriptConfig,
  defaultModuleConfig,
} = require('@yay-bulk-order/common/src/config/webpackConfig.helper.cjs');

// Output path is left to `@wordpress/scripts`' own `--output-path` CLI flag
// (see package.json's per-family `build:*`/`dev:*` scripts), the same way
// the free `blocks` package scopes each of its own families.
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
