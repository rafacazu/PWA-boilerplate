const path = require("path");
const DotenvPlugin = require("webpack-dotenv-plugin");
//const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const plugins = [
  // Uncomment this line for webpack build analysing
  // new BundleAnalyzerPlugin(),
];

// Add DotEnv for parsing .env variables (will fail if .envs not available)
try {
  plugins.push(
    new DotenvPlugin({
      path: "./.env",
      sample: "./.env.example",
    })
  );
} catch (error) {
  // Do nothing if plugin fails, developers don't need to have local .env's
}

module.exports = {
  // Mode and entries are listed in the Gulp 'webpack' task
  plugins,
  mode: "production",
  output: {
    filename: (chunkData) => `${chunkData.chunk.name}.js`,
    chunkFilename: "[contenthash].bundle.js",
  },
  externals: [
    {
      // Defines the module "coveo-search-ui" as external, "Coveo" is defined in the global scope.
      // This requires you to load the original CoveoJsSearch.js file in your page.
      //"coveo-search-ui": "Coveo",
    },
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "raw!html-minify",
      },
      {
        test: /\.scss$/,
        loader: "ignore-loader",
      },
      {
        test: /\.m?js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: [".webpack.js", ".web.js", ".tsx", ".ts", ".js"],
    modules: [path.join(__dirname), "node_modules"],
    alias: {
      Common: path.resolve(__dirname, "src/app/common/"),
    },
  },
};
