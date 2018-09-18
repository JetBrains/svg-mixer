const path = require('path');

const merge = require('merge-options');

module.exports = (config = {}) => {
  const plugins = config.plugins || [];

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
      rules: [

      ]
    },

    plugins
  }, config);
};
