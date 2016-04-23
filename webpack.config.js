module.exports = {
  watch: true,
  entry: [
    "babel-polyfill",
    "./src/app.js",
  ],
  output: {
    filename: "bundle.js",
    path: ".",
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style!css",
      },
      {
        test: /\.html$/,
        loader: "raw",
      },
      {
        test: /\.pug$/,
        loader: "jade"
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: [
          require("path").resolve(__dirname, "node_modules"),
        ],
        query: {
          plugins: ["transform-runtime"],
          presets: ["modern", "stage-0"],
        },
      },
      {
        test: /\.s[ac]ss$/,
        loader: "style!css!sass",
      },
    ],
  },
}
