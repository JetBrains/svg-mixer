const utils = require('svg-mixer-test/utils');
const supports = utils.webpackFeatureDetector(require('webpack'));
const ExtractCssPlugin = !supports.miniCssExtractPlugin && require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = supports.miniCssExtractPlugin && require('mini-css-extract-plugin');
const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

module.exports = utils.createBaseWebpackConfig({
  entry: './entry.css',

  module: {
    rules: [
      {
        test: /\.svg$/,
        ...SpritePlugin.extract({
          publicPath: 'http://loh.com/'
        })
      },
      {
        test: /\.css$/,
        use: supports.miniCssExtractPlugin
          ? [
            MiniCssExtractPlugin.loader,
            'css-loader',
            SpritePlugin.extractFromCss()
          ]
          : ExtractCssPlugin.extract({use: [
              'css-loader',
              SpritePlugin.extractFromCss()
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
