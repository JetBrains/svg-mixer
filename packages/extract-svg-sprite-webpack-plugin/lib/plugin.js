const { validate } = require('svg-mixer-utils');

const configure = require('./configurator');
const SpriteCompiler = require('./sprite-compiler');
const {
  NAMESPACE,
  LOADER_PATH,
  CSS_LOADER_PATH
} = require('./config');
const Replacer = require('./utils/replacer');

let INSTANCE_COUNTER = 0;

class ExtractSvgSpritePlugin {
  static loader(options) {
    return { loader: LOADER_PATH, options };
  }

  static cssLoader() {
    return { loader: CSS_LOADER_PATH };
  }

  constructor(cfg) {
    this.id = ++INSTANCE_COUNTER;
    this.config = configure(cfg);

    const errors = validate(require('../schemas/plugin'), this.config);

    if (errors.length) {
      throw new Error(errors.join('\n'));
    }

    this.compiler = new SpriteCompiler(this.config);
  }

  get NAMESPACE() {
    return NAMESPACE;
  }

  apply(compiler) {
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
        compilation.hooks.normalModuleLoader
          .tap(NAMESPACE, loaderCtx => this.hookNormalModuleLoader(loaderCtx));

        compilation.hooks.additionalAssets
          .tapPromise(NAMESPACE, () => compileSprites(compilation)
            .then(result => this.hookAdditionalAssets(compilation, result)));
      });

      compiler.hooks.compilation.tap(NAMESPACE, compilation => {
        if (
          compilation.compiler.name &&
          compilation.compiler.name.startsWith('mini-css-extract-plugin')
        ) {
          compilation.hooks.additionalAssets
            .tapPromise(NAMESPACE, () => compileSprites(compilation)
              .then(result => this.hookAdditionalAssets(compilation, result)));
        }

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
        if (
          compilation.compiler.name &&
          compilation.compiler.name.startsWith('html-webpack-plugin')
        ) {
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
    loaderContext[NAMESPACE] = this;
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
