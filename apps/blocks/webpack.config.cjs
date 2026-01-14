const path = require("path");
const [
  scriptConfig,
  moduleConfig,
] = require("@wordpress/scripts/config/webpack.config");
const [
  scriptExtractionPlugin,
  moduleExtractionPlugin,
] = require("@yay-bulk-order/common/src/bulkOrderExtractionPlugin.cjs");

const extendedScriptConfig = {
  ...scriptConfig,

  output: {
    ...scriptConfig.output,
    path: path.resolve(__dirname, "../../assets/dist/blocks"),
  },

  plugins: [
    ...scriptConfig.plugins.filter(
      (plugin) =>
        plugin.constructor.name !== "DependencyExtractionWebpackPlugin",
    ),
    scriptExtractionPlugin,
  ],
};

const extendedModuleConfig = {
  ...moduleConfig,
  output: {
    ...moduleConfig.output,
    path: path.resolve(__dirname, "../../assets/dist/blocks"),
  },
  plugins: [
    ...scriptConfig.plugins.filter(
      (plugin) =>
        plugin.constructor.name !== "DependencyExtractionWebpackPlugin",
    ),
    moduleExtractionPlugin,
  ],
};

module.exports = [extendedScriptConfig, extendedModuleConfig];
