const path = require("path");
const [
  ,
  defaultModuleConfig,
] = require("@wordpress/scripts/config/webpack.config");
const {
  moduleExtractionPlugin,
} = require("@yay-bulk-order/common/src/bulkOrderExtractionPlugin.cjs");

module.exports = {
  ...defaultModuleConfig,
  entry: { "bulk-order-view": path.resolve(__dirname, "src/view.index.ts") },

  output: {
    ...defaultModuleConfig.output,
    filename: "[name].js",
    path: path.resolve(__dirname, "../../../assets/dist/view"),
  },

  plugins: [
    ...defaultModuleConfig.plugins.filter(
      (plugin) =>
        plugin.constructor.name !== "DependencyExtractionWebpackPlugin",
    ),
    moduleExtractionPlugin,
  ],
};
