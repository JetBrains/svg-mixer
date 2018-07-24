const utils = require('svg-mixer-test/utils');
const HtmlPlugin = require('html-webpack-plugin');
const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

module.exports = utils.createBaseWebpackConfig({
  module: {
    rules: [
      {
        test: /\.svg$/,
        ...SpritePlugin.loader()
      }
    ]
  },

  plugins: [
    new HtmlPlugin({ template: './template.ejs' }),
    new SpritePlugin({ emit: false })
  ]
}, {
  remove: ['main.js']
});
