const path = require('path');

const config = {
  entry: {
    sprite: './src/sprite',
    symbol: './src/symbol',
    'browser-sprite': './src/browser-sprite'
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
