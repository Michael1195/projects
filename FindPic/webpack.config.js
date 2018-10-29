const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: ["@babel/polyfill", "./src/index.js"],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader"
        ]
      },
      {
        test: /\.hbs$/,
        exclude: /node_modules/,
        use: ["handlebars-loader"]
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "img/[name].[ext]?[hash]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin("build"),
    new MiniCssExtractPlugin({
      filename: "styles.css"
    }),
    new HtmlWebpackPlugin({
      hash: true,
      template: "./public/index.html",
      filename: "index.html"
    })
  ],
  devServer: {
    historyApiFallback: true,
    noInfo: false,
    quiet: false,
    stats: "errors-only",
    clientLogLevel: "warning",
    compress: true,
    port: 9098
  }
};
