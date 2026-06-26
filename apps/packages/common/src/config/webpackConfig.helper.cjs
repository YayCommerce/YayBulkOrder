const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

const globalModules = [
  // ['@yay-bulk-order/utils', ['YayBulkOrder', 'utils']],
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

const scriptExtractionPlugin = new DependencyExtractionWebpackPlugin({
  requestToExternal(request) {
    globalModules.forEach(([packageName, resolvedModule]) => {
      if (request === packageName) {
        return resolvedModule;
      }
    });
  },
});

const defaultConfigs = require('@wordpress/scripts/config/webpack.config');

let defaultScriptConfig;
let defaultModuleConfig;
if (Array.isArray(defaultConfigs)) {
  defaultScriptConfig = defaultConfigs[0];
  defaultModuleConfig = defaultConfigs[1];
} else {
  defaultScriptConfig = defaultConfigs;
  defaultModuleConfig = defaultConfigs;
}

module.exports = { moduleExtractionPlugin, scriptExtractionPlugin, defaultScriptConfig, defaultModuleConfig };
