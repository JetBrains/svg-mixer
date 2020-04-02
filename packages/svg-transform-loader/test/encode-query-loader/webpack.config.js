const path = require('path');

const ExtractPlugin = require('extract-text-webpack-plugin');
const { FIXTURES_DIR } = require('svg-mixer-test');

module.exports = {
  context: __dirname,

  entry: './entry.css',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },

  resolve: {
    alias: {
      fixtures: FIXTURES_DIR
    }
  },

  module: {
    rules: [
      {
        test: /\.svg(\?.*)?$/,
        use: [
          {
            loader: require.resolve('file-loader'),
            options: { name: '[name].[ext]' }
          },
          'svg-transform-loader'
        ]
      },

      {
        test: /\.css$/,
        use: ExtractPlugin.extract({
          use: [
            'css-loader',
            'svg-transform-loader/encode-query',
            'postcss-loader'
          ]
        })
      }
    ]
  },

  plugins: [
    new ExtractPlugin('[name].css')
  ]
};
