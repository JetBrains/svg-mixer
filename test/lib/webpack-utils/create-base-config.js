const path = require('path');

const merge = require('merge-options');

module.exports = (config = {}) => {
  return merge(
    {
      entry: './main',

      output: {
        path: path.resolve(config.context || process.cwd(), 'build'),
        filename: '[name].js'
      },

      devtool: false,
      mode: 'development',

      resolve: {
        alias: {
          fixtures: path.resolve(__dirname, '../../fixtures')
        }
      }
    },
    config
  );
};
