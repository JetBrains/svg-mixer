const SpritePlugin = require('extract-svg-sprite-webpack-plugin');
const { createConfig } = require('../../utils');

module.exports = createConfig({
  context: __dirname,
  target: 'node',
  entry: './main',
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: SpritePlugin.loader
      }
    ]
  },
  plugins: [new SpritePlugin()]
});
