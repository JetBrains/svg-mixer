const path = require('path');

const config = {
  entry: {
    sprite: './lib/sprite',
    symbol: './lib/symbol',
    'browser-sprite': './lib/browser-sprite'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd'
  },

  devtool: false,

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  }
};

module.exports = config;
