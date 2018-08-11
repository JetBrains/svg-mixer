const utils = require('svg-mixer-test/utils');
const supports = utils.webpackFeatureDetector(require('webpack'));
const ExtractCssPlugin = !supports.miniCssExtractPlugin && require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = supports.miniCssExtractPlugin && require('mini-css-extract-plugin');
const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

module.exports = utils.createBaseWebpackConfig({
  entry: {
    // 'qwe': './main.css',
    // 'qwe2': './main2.css',
    // 'qwe3': './main3.css',
    main: './main',
    main2: './main2'
  },

  output: {
    filename: '[name].[chunkhash:6].js'
  },

  // mode: 'development',
  devtool: false,

  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [SpritePlugin.loader()]
      },
      // {
      //   test: /\.css$/,
      //   use: supports.miniCssExtractPlugin
      //     ? [
      //       MiniCssExtractPlugin.loader,
      //       'css-loader',
      //       SpritePlugin.cssLoader()
      //     ]
      //     : ExtractCssPlugin.extract({use: [
      //         'css-loader',
      //         SpritePlugin.cssLoader()
      //       ]
      //     })
      // }
    ]
  },

  plugins: [
    // supports.miniCssExtractPlugin
    //   ? new MiniCssExtractPlugin({ filename: '[name].[hash].css' })
    //   : new ExtractCssPlugin('[name].[chunkhash:6].css'),

    new SpritePlugin({
      filename: '[name].svg'
    })
  ]
}, {
  remove: ['main.js']
});
