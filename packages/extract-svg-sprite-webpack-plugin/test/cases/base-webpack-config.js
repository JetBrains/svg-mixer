const path = require('path');

const merge = require('merge-options');

const { FIXTURES_DIR, RemoveAssetsWebpackPlugin } = require('svg-mixer-test/utils');

module.exports = (config = {}, options = {}) => {
  const plugins = config.plugins || [];

  if (Array.isArray(options.remove)) {
    plugins.push(new RemoveAssetsWebpackPlugin(options.remove))
  }

  return merge({
    output: {
      path: path.resolve(config.context || process.cwd(), 'build'),
      filename: '[name].js'
    },

    resolve: {
      alias: {
        fixtures: FIXTURES_DIR
      }
    },

    plugins
  }, config);
};
