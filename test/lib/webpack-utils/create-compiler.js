/* eslint-disable new-cap */
const path = require('path');

const merge = require('merge-options');

let _webpack;
let _memoryFs;

try {
  _webpack = require('webpack');
  _memoryFs = require('memory-fs');
} catch (e) {
  // nothing
}

/**
 * @param {Object} [config]
 * @param {MemoryFileSystem} [inputFs]
 * @return {Compiler} compiler
 * @return {Function<Promise<Compilation>>} compiler.run
 */
module.exports = (config, {
  memoryInputFs = false,
  webpack = _webpack,
  memoryFs = _memoryFs
} = {}) => {
  const cfg = merge({
    output: {
      path: path.resolve(process.cwd(), 'build'),
      filename: '[name].js'
    }
  }, config);

  const compiler = webpack(cfg);
  compiler.outputFileSystem = new memoryFs();

  if (memoryInputFs) {
    const inputFs = new memoryFs();
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
              .map(e => (typeof e === 'string' ? e : `${e.message}\n${e.stack}`))
              .join('\n');
            return reject(new Error(msg));
          }

          return resolve(stats.compilation);
        });
      });
    }
  };
};
