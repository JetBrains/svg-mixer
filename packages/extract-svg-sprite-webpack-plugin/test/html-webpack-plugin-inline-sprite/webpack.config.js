const { createBaseConfig } = require('svg-mixer-test').webpack;
const HtmlPlugin = require('html-webpack-plugin');
const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

module.exports = createBaseConfig({
  context: __dirname,
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: SpritePlugin.loader
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
