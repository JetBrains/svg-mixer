const path = require('path');

const merge = require('merge-options');

const RemoveAssetsWebpackPlugin = require('./remove-assets-plugin');

module.exports = (config = {}, options = {}) => {
  const plugins = config.plugins || [];

  if (Array.isArray(options.remove)) {
    plugins.push(new RemoveAssetsWebpackPlugin(options.remove));
  }

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

    plugins
  }, config);
};
