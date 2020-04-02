const { webpack } = require('svg-mixer-test');
const supports = webpack.featureDetector(require('webpack'));
const ExtractCssPlugin = !supports.miniCssExtractPlugin && require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = supports.miniCssExtractPlugin && require('mini-css-extract-plugin');
const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

module.exports = webpack.createBaseConfig({
  entry: './main.css',
  context: __dirname,

  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: SpritePlugin.loader
      },
      {
        test: /\.css$/,
        use: supports.miniCssExtractPlugin
          ? [
            MiniCssExtractPlugin.loader,
            'css-loader',
            SpritePlugin.cssLoader
          ]
          : ExtractCssPlugin.extract({use: [
              'css-loader',
              SpritePlugin.cssLoader
            ]
          })
      }
    ]
  },

  plugins: [
    supports.miniCssExtractPlugin
      ? new MiniCssExtractPlugin()
      : new ExtractCssPlugin('[name].css'),

    new SpritePlugin()
  ]
}, {
  remove: ['main.js']
});
