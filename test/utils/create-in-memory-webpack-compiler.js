const path = require('path');

const merge = require('merge-options');
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

/**
 * @param {Object} [config]
 * @param {MemoryFileSystem} [inputFs]
 * @return {Compiler} compiler
 * @return {Function<Promise<Compilation>>} compiler.run
 */
module.exports = (config, inputFs = new MemoryFS()) => {
  const cfg = merge({
    output: {
      path: path.resolve(process.cwd(), 'build'),
      filename: '[name].js'
    }
  }, config);

  const outputFs = new MemoryFS();

  const compiler = webpack(cfg);

  compiler.inputFileSystem = inputFs;
  compiler.resolvers.normal.fileSystem = inputFs;
  compiler.resolvers.context.fileSystem = inputFs;
  compiler.outputFileSystem = outputFs;

  return {
    ...compiler,
    run() {
      return new Promise((resolve, reject) => {
        compiler.run((err, stats) => (err ? reject(err) : resolve(stats.compilation)));
      });
    }
  };
};
