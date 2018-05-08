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
module.exports = (config, memoryInputFs = false) => {
  const cfg = merge({
    output: {
      path: path.resolve(process.cwd(), 'build'),
      filename: '[name].js'
    }
  }, config);

  const compiler = webpack(cfg);
  compiler.outputFileSystem = new MemoryFS();

  if (memoryInputFs) {
    const inputFs = new MemoryFS();
    compiler.inputFileSystem = inputFs;
    compiler.resolvers.normal.fileSystem = inputFs;
    compiler.resolvers.context.fileSystem = inputFs;
  }

  return {
    ...compiler,
    run() {
      return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) {
            return reject(err);
          }

          if (stats.compilation.errors.length > 0) {
            const msg = stats.compilation.errors
              .map(e => `${e.message}\nSTACK:\n${e.stack}`)
              .join('\n');
            return reject(new Error(msg));
          }

          return resolve(stats.compilation);
        });
      });
    }
  };
};
