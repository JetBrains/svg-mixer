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
 * In webpack >= 4.29.0 reading assets after emitting is no longer allowed
 * This plugin collects assets before compiler ends
 * @see https://github.com/webpack/webpack/releases/tag/v4.29.0
 */
class CollectAssetsPlugin {
  apply(compiler) {
    function handler(c, done) {
      this.assets = Object.keys(c.assets).reduce((acc, name) => {
        acc[name] = c.assets[name].source().toString().trim();
        return acc;
      }, {});
      done();
    }

    if (compiler.hooks) {
      compiler.hooks.emit.tapAsync(
        CollectAssetsPlugin.constructor.name,
        handler.bind(this)
      );
    } else {
      compiler.plugin('emit', handler.bind(this));
    }
  }
}

/**
 * @param {Object} [config]
 * @param {MemoryFileSystem} [inputFs]
 * @return {Compiler} compiler
 * @return {Function<Promise<Compilation>>} compiler.run
 */
module.exports = (
  config,
  { memoryInputFs = false, webpack = _webpack, memoryFs = _memoryFs } = {}
) => {
  const cfg = merge(
    {
      output: {
        path: path.resolve(process.cwd(), 'build'),
        filename: '[name].js'
      }
    },
    config
  );

  if (!cfg.plugins) {
    cfg.plugins = [];
  }

  const collectAssetsPlugin = new CollectAssetsPlugin();
  cfg.plugins.push(collectAssetsPlugin);

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
              .map(e =>
                typeof e === 'string' ? e : `${e.message}\n${e.stack}`
              )
              .join('\n');
            return reject(new Error(msg));
          }

          const assets = collectAssetsPlugin.assets;
          const { errors, warnings } = stats.compilation;

          return resolve({
            assets,
            errors,
            warnings
          });
        });
      });
    }
  };
};
