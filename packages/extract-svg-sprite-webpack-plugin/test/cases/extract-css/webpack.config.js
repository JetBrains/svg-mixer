const ExtractCssPlugin = require('extract-text-webpack-plugin');
const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

const config = require('../base-webpack-config');

module.exports = config({
  context: __dirname,

  entry: './entry.css',

  module: {
    rules: [
      {
        test: /\.svg$/,
        ...SpritePlugin.extract()
      },
      {
        test: /\.css$/,
        use: ExtractCssPlugin.extract({
          use: [
            'css-loader',
            SpritePlugin.extractFromCss()
          ]
        })
      }
    ]
  },

  plugins: [
    new ExtractCssPlugin('[name].css'),
    new SpritePlugin()
  ]
}, {
  remove: ['main.js']
});
