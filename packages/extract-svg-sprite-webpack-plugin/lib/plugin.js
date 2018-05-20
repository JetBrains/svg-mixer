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
  static extract(options) {
    return { loader: LOADER_PATH, options };
  }

  static extractFromCss() {
    return { loader: CSS_LOADER_PATH };
  }

  constructor(cfg) {
    this.id = ++INSTANCE_COUNTER;
    this.config = configure(cfg);
    this.compiler = new SpriteCompiler(this.config);
  }

  get NAMESPACE() {
    return NAMESPACE;
  }

  addSymbol(symbol) {
    this.compiler.addSymbol(symbol);
  }

  apply(compiler) {
    // TODO refactor this ugly way to avoid double compilation when using extract-text-webpack-plugin
    let prevResult;
    // eslint-disable-next-line arrow-body-style
    const compileSprites = () => {
      return (
        prevResult
          ? Promise.resolve(prevResult)
          : this.compiler.compile()
      ).then(result => {
        prevResult = result;
        return result;
      });
    };

    if (compiler.hooks) {
      compiler.hooks.compilation.tap(NAMESPACE, compilation => {
        compilation.hooks.normalModuleLoader
          .tap(NAMESPACE, loaderCtx => this.hookNormalModuleLoader(loaderCtx));

        compilation.hooks.additionalAssets
          .tapPromise(NAMESPACE, () => compileSprites()
            .then(result => this.hookAdditionalAssets(compilation, result)));
      });
    } else {
      compiler.plugin('compilation', compilation => {
        compilation.plugin(
          'normal-module-loader',
          loaderCtx => this.hookNormalModuleLoader(loaderCtx)
        );

        compilation.plugin('additional-assets', done => compileSprites().then(result => {
          this.hookAdditionalAssets(compilation, result);
          done();
        }));
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
        compilation.assets[filename] = {
          source: () => content,
          size: () => content.length
        };
      }
    });
  }
}

module.exports = ExtractSvgSpritePlugin;
