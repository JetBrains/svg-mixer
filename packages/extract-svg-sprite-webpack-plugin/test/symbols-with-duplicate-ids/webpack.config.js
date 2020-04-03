const { createBaseConfig } = require('svg-mixer-test').webpack;
const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

module.exports = createBaseConfig({
  context: __dirname,
  module: {
    rules: [
      {
        test: /\.svg/,
        loader: SpritePlugin.loader
      }
    ]
  },

  plugins: [
    new SpritePlugin()
  ]
});
