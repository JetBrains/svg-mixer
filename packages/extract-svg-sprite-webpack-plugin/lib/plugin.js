const path = require('path');

const { validate } = require('svg-mixer-utils');

const { name: packageName } = require('../package.json');
const schemas = require('../schemas');

const config = require('./config');
const SpriteCompiler = require('./utils/sprite-compiler');
const { configurator: configure, Replacer } = require('./utils');
const {
  isHtmlPluginCompilation,
  isMiniExtractCompilation,
  getAllModules,
  isChildCompilation
} = require('./utils').helpers;

let INSTANCE_COUNTER = 0;

class ExtractSvgSpritePlugin {
  static loader(options) {
    if (options) {
      const errors = validate(schemas.loader, options);

      if (errors.length) {
        throw new Error(`${packageName}: ${errors.join('\n')}`);
      }
    }

    return { loader: config.LOADER_PATH, options };
  }

  static cssLoader(options) {
    if (options) {
      const errors = validate(schemas.cssLoader, options);

      if (errors.length) {
        throw new Error(`${packageName}: ${errors.join('\n')}`);
      }
    }

    return { loader: config.CSS_LOADER_PATH };
  }

  constructor(cfg) {
    this.id = ++INSTANCE_COUNTER;
    this.config = configure(cfg);

    const errors = validate(schemas.plugin, this.config);

    if (errors.length) {
      throw new Error(`${packageName}: ${errors.join('\n')}`);
    }

    this.compiler = new SpriteCompiler(this.config);
  }

  get NAMESPACE() {
    return config.NAMESPACE;
  }

  /**
   * @return {SpriteSymbol[]}
   */
  get symbols() {
    return this.compiler.symbols;
  }

  apply(compiler) {
    const plugin = this;
    const { NAMESPACE } = config;

    // TODO refactor this ugly way to avoid double compilation when using extract-text-webpack-plugin
    let prevResult;
    // eslint-disable-next-line arrow-body-style
    const compileSprites = compilation => {
      return (
        prevResult
          ? Promise.resolve(prevResult)
          : this.compiler.compile(compilation)
      ).then(result => {
        prevResult = result;
        return result;
      });
    };

    if (compiler.hooks) {
      compiler.hooks.thisCompilation.tap(NAMESPACE, compilation => {
        compilation.hooks.additionalAssets
          .tapPromise(NAMESPACE, () => compileSprites(compilation)
            .then(result => this.hookAdditionalAssets(compilation, result)));
      });

      compiler.hooks.compilation.tap(NAMESPACE, compilation => {
        compilation.hooks.normalModuleLoader
          .tap(NAMESPACE, loaderCtx => this.hookNormalModuleLoader(loaderCtx));

        // compilation.hooks.afterOptimizeChunks.tap(NAMESPACE, chunks => {
        //   this.hookAfterOptimizeChunks(chunks, compilation);
        // });
        //
        // compilation.hooks.afterOptimizeChunkIds.tap(NAMESPACE, chunks => {
        //   this.hookAfterOptimizeChunkIds(chunks, compilation);
        // });

        // compilation.hooks.additionalAssets
        //   .tapPromise(NAMESPACE, () => compileSprites(compilation)
        //     .then(result => this.hookAdditionalAssets(compilation, result)));

        if (compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
          compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration
            .tapAsync(NAMESPACE, (htmlPluginData, done) => compileSprites(compilation)
              .then(result => {
                this.hookBeforeHtmlGeneration(htmlPluginData, result);
                done(null, htmlPluginData);
              }));
        }
      });

      compiler.hooks.emit.tapAsync(NAMESPACE, (compilation, done) => {
        this.hookEmit(compilation);
        done();
      });
    } else {
      compiler.plugin('this-compilation', compilation => {
        compilation.plugin('additional-assets', done => compileSprites(compilation).then(result => {
          this.hookAdditionalAssets(compilation, result);
          done();
        }));
      });

      compiler.plugin('compilation', compilation => {
        if (isHtmlPluginCompilation(compilation)) {
          return;
        }

        compilation.plugin(
          'normal-module-loader',
          loaderCtx => this.hookNormalModuleLoader(loaderCtx)
        );

        compilation.plugin('after-optimize-chunks', chunks => {
          this.hookAfterOptimizeChunks(chunks, compilation);
        });

        compilation.plugin('after-optimize-chunk-ids', chunks => {
          this.hookAfterOptimizeChunkIds(chunks, compilation);
        });

        // compilation.plugin('additional-assets', done => compileSprites(compilation).then(result => {
        //   this.hookAdditionalAssets(compilation, result);
        //   done();
        // }));

        compilation.plugin(
          'html-webpack-plugin-before-html-generation',
          (htmlPluginData, done) => compileSprites(compilation).then(result => {
            this.hookBeforeHtmlGeneration(htmlPluginData, result);
            done(null, htmlPluginData);
          })
        );

      });

      compiler.plugin('emit', (compilation, done) => {
        this.hookEmit(compilation);
        done();
      });
    }
  }

  hookAfterOptimizeChunks(chunks, compilation) {
    const isChild = compilation.compiler.isChild();
    const allModules = getAllModules(compilation);
    const modules = this.compiler.symbols.map(s => s.module);
    const modulesChunks = modules.map(m => m.getChunks());
    return modulesChunks;
  }

  hookAfterOptimizeChunkIds(chunks, compilation) {
    const isChild = compilation.compiler.isChild();
    const modules = this.compiler.symbols.map(s => s.module);
    const modulesChunks = modules.map(m => m.getChunks());
    return modulesChunks;
  }

  hookEmit(compilation) {
    return compilation;
  }

  hookNormalModuleLoader(loaderContext) {
    loaderContext[config.NAMESPACE] = this;
  }

  hookAdditionalAssets(compilation, result) {
    if (isChildCompilation(compilation)) {
      return;
    }

    result.forEach(({ filename, content, sprite }) => {
      sprite.symbols.forEach(s => {
        // Replacer.replaceInModuleSource(s.module, s.replacements, compilation);
        // Replacer.replaceInModuleSource(s.module.issuer, s.replacements, compilation);
      });

      if (filename) {
        compilation.assets[filename.split('?')[0]] = {
          source: () => content,
          size: () => content.length
        };
      }
    });
  }

  hookBeforeHtmlGeneration(htmlPluginData, result) {
    htmlPluginData.assets.sprites = result
      .map(({ filename, content }) => ({ filename, content }));
  }
}

module.exports = ExtractSvgSpritePlugin;
