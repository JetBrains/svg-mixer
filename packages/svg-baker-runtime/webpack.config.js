const path = require('path');

const config = {
  entry: './lib/utils',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },

  devtool: 'source-map',

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
