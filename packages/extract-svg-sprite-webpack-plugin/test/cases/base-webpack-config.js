const path = require('path');

const merge = require('merge-options');

const { FIXTURES_DIR } = require('../../../../test/utils');

module.exports = (config = {}, options = {}) => {
  const plugins = config.plugins || [];

  if (Array.isArray(options.remove)) {
    plugins.push({
      apply(compiler) {
        compiler.plugin('emit', (compilation, done) => {
          options.remove.forEach(filename => delete compilation.assets[filename]);
          done();
        });
      }
    })
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
