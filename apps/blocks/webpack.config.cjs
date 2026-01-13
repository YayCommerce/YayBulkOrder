const path = require("path");
const [
  scriptConfig,
  moduleConfig,
] = require("@wordpress/scripts/config/webpack.config");
const bulkOrderExtractionPlugin = require("@yay-bulk-order/common/src/bulkOrderExtractionPlugin.cjs");

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
    bulkOrderExtractionPlugin,
  ],
};

const extendedModuleConfig = {
  ...moduleConfig,
  experiments: { outputModule: true },
  output: {
    ...moduleConfig.output,
    path: path.resolve(__dirname, "../../assets/dist/blocks"),
    library: { type: "module" },
  },
  plugins: [
    ...scriptConfig.plugins.filter(
      (plugin) =>
        plugin.constructor.name !== "DependencyExtractionWebpackPlugin",
    ),
    bulkOrderExtractionPlugin,
  ],
};

module.exports = [extendedScriptConfig, extendedModuleConfig];
