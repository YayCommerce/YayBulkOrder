const path = require("path");
const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const bulkOrderExtractionPlugin = require("@yay-bulk-order/common/src/bulkOrderExtractionPlugin.cjs");

module.exports = {
  ...defaultConfig,
  experiments: { outputModule: true },
  entry: { "bulk-order-view": path.resolve(__dirname, "src/view.index.ts") },

  output: {
    ...defaultConfig.output,
    filename: "[name].js",
    library: { type: "module" },
    path: path.resolve(__dirname, "../../../assets/dist/view"),
    module: true,
  },

  plugins: [
    ...defaultConfig.plugins.filter(
      (plugin) =>
        plugin.constructor.name !== "DependencyExtractionWebpackPlugin",
    ),
    bulkOrderExtractionPlugin,
  ],
};
