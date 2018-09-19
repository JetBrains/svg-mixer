const path = require('path');

const merge = require('webpack-merge');

module.exports = (config = {}) => {
  return merge({
    entry: './main',

    output: {
      path: path.resolve(config.context || process.cwd(), 'build'),
      filename: '[name].js'
    },

    devtool: false,

    resolve: {
      alias: {
        fixtures: path.resolve(__dirname, '../../fixtures')
      }
    },

    module: {
      rules: []
    }
  }, config);
};
