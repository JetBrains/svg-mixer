const { createBaseConfig } = require('svg-mixer-test').webpack;
const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

module.exports = createBaseConfig({
  entry: './main',
  context: __dirname,
  output: {
    libraryTarget: 'commonjs2',
  },
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
