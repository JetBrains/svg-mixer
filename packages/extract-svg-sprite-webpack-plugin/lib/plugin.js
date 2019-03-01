const { validate } = require('svg-mixer-utils');

const { name: packageName } = require('../package.json');
const schemas = require('../schemas');

const config = require('./config');
const SpriteCompiler = require('./utils/sprite-compiler');
const { configurator: configure, Replacer } = require('./utils');
const {
  isHtmlPluginCompilation
} = require('./utils').helpers;

let INSTANCE_COUNTER = 0;

class ExtractSvgSpritePlugin {
  static get loader() {
    return config.LOADER_PATH;
  }

  static get cssLoader() {
    return config.CSS_LOADER_PATH;
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

  apply(compiler) {
    const { NAMESPACE } = config;

    // TODO refactor this ugly way to avoid double compilation when using extract-text-webpack-plugin
    // eslint-disable-next-line arrow-body-style
    const compileSprites = compilation => {
      return (
        this.prevResult
          ? Promise.resolve(this.prevResult)
          : this.compiler.compile(compilation)
      ).then(result => {
        this.prevResult = result;
        return result;
      });
    };

    if (compiler.hooks) {
      compiler.hooks.thisCompilation.tap(NAMESPACE, compilation => {
        compilation.hooks.optimizeTree
          .tapPromise(NAMESPACE, () => compileSprites(compilation)
            .then(result => {
              result.forEach(({ sprite }) => {
                sprite.symbols.forEach(s => {
                  if (s.cssModules && s.cssModules.length) {
                    s.cssModules.forEach(m => {
                      Replacer.replaceInModuleSource(m, s.replacements, compilation);
                    });
                  }
                });
              });
            }));

        compilation.hooks.additionalAssets
          .tapPromise(NAMESPACE, () => compileSprites(compilation)
            .then(result => this.hookAdditionalAssets(compilation, result)));
      });

      compiler.hooks.compilation.tap(NAMESPACE, compilation => {
        compilation.hooks.normalModuleLoader
          .tap(NAMESPACE, loaderCtx => this.hookNormalModuleLoader(loaderCtx));

        if (compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
          compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration
            .tapAsync(NAMESPACE, (htmlPluginData, done) => compileSprites(compilation)
              .then(result => {
                this.hookBeforeHtmlGeneration(htmlPluginData, result);
                done(null, htmlPluginData);
              }));
        }
      });
    } else {
      compiler.plugin('compilation', compilation => {
        if (isHtmlPluginCompilation(compilation)) {
          return;
        }

        compilation.plugin(
          'normal-module-loader',
          loaderCtx => this.hookNormalModuleLoader(loaderCtx)
        );

        compilation.plugin('additional-assets', done => compileSprites(compilation).then(result => {
          this.hookAdditionalAssets(compilation, result);
          done();
        }));

        compilation.plugin(
          'html-webpack-plugin-before-html-generation',
          (htmlPluginData, done) => compileSprites(compilation).then(result => {
            this.hookBeforeHtmlGeneration(htmlPluginData, result);
            done(null, htmlPluginData);
          })
        );

      });
    }
  }

  hookNormalModuleLoader(loaderContext) {
    loaderContext[config.NAMESPACE] = this;
  }

  hookAdditionalAssets(compilation, result) {

    result.forEach(({ filename, content, sprite }) => {
      sprite.symbols.forEach(s => {
        Replacer.replaceInModuleSource(s.module, s.replacements, compilation);
        Replacer.replaceInModuleSource(s.module.issuer, s.replacements, compilation);
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
