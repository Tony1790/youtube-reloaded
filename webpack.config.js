const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

console.log(path.resolve(__dirname, "assets", "js"));

module.exports = {
  entry: "./src/client/js/main.js",
  mode: "development",
  watch: true, //heroku로 변경시 수정
  clean: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  output: {
    filename: "js/main.js",
    path: path.resolve(__dirname, "assets"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"], //webpack은 역순으로 뒤부터 시작한다.
      },
    ],
  },
};
