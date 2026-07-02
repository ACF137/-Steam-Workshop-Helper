const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "cheap-module-source-map",
  entry: {
    content:    "./src/content/content.ts",
    background: "./src/background/background.ts",
  },
  output: {
    path:     path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean:    true,
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new CopyPlugin({ patterns: [{ from: "public", to: "." }] }),
  ],
};
