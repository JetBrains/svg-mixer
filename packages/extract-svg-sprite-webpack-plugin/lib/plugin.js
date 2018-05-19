/* eslint-disable new-cap,no-param-reassign */
const merge = require('merge-options');
const mixer = require('svg-mixer');

const SpriteCompiler = require('./sprite-compiler');
const {
  NAMESPACE,
  LOADER_PATH,
  CSS_LOADER_PATH,
  NO_SPRITE_FILENAME
} = require('./config');
const Replacer = require('./utils/replacer');

let INSTANCE_COUNTER = 0;

/**
 * @typedef {Object} ExtractSvgSpritePluginConfig
 * @property {string|function(path, query)} symbolId='[name]'
 * @property {string|function(path, query)} filename='sprite.svg'
 * @property {boolean} emit=true
 * @property {string[]} runtimeFields
 * @property {string} selector=null
 * @property {string} spriteType 'classic' | 'stack'
 * @property {mixer.Sprite} spriteClass
 * @property {mixer.SpriteSymbol} symbolClass
 */

class ExtractSvgSpritePlugin {
  /**
   * @return {ExtractSvgSpritePluginConfig}
   */
  static get defaultConfig() {
    return {
      symbolId: '[name]',
      filename: 'sprite.svg',
      emit: true,
      runtimeFields: [
        'id',
        'width',
        'height',
        'viewBox',
        'url',
        'toString'
      ],
      selector: null,
      spriteType: mixer.Sprite.TYPE,
      spriteClass: mixer.Sprite,
      symbolClass: mixer.SpriteSymbol
    };
  }

  static extract(options) {
    return { loader: LOADER_PATH, options };
  }

  static extractFromCss(options) {
    return { loader: CSS_LOADER_PATH, options };
  }

  constructor(cfg) {
    this.id = ++INSTANCE_COUNTER;
    /**
     * @type {ExtractSvgSpritePluginConfig}
     */
    const config = merge(this.constructor.defaultConfig, cfg || {});

    switch (config.spriteType) {
      default:
      case mixer.Sprite.TYPE:
        config.spriteClass = mixer.Sprite;
        config.runtimeFields = config.runtimeFields.concat([
          'bgPosition',
          'bgSize'
        ]);
        break;

      case mixer.StackSprite.TYPE:
        config.spriteClass = mixer.StackSprite;
        break;
    }

    this.config = config;
    this.compiler = new SpriteCompiler(config);
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
    /**
     * @return {Promise<any>}
     */
    const getSprites = () => (
      prevResult
        ? Promise.resolve(prevResult)
        : this.compiler.compile()
    ).then(sprites => {
      prevResult = sprites;
      return sprites;
    });

    if (compiler.hooks) {
      compiler.hooks.compilation.tap(NAMESPACE, compilation => {
        compilation.hooks.normalModuleLoader
          .tap(NAMESPACE, loaderCtx => this.hookNormalModuleLoader(loaderCtx));

        compilation.hooks.additionalAssets
          .tapPromise(NAMESPACE, () => getSprites()
            .then(sprites => this.hookAdditionalAssets(compilation, sprites)));
      });
    } else {
      compiler.plugin('compilation', compilation => {
        compilation.plugin(
          'normal-module-loader',
          loaderCtx => this.hookNormalModuleLoader(loaderCtx)
        );

        compilation.plugin('additional-assets', done => getSprites().then(sprites => {
          this.hookAdditionalAssets(compilation, sprites);
          done();
        }));
      });
    }
  }

  hookNormalModuleLoader(loaderContext) {
    loaderContext[NAMESPACE] = this;
  }

  hookAdditionalAssets(compilation, sprites) {
    sprites.forEach(sprite => {
      sprite.symbols.forEach(s => {
        Replacer.replaceInModuleSource(s.module, s.replacements, compilation);
        Replacer.replaceInModuleSource(s.module.issuer, s.replacements, compilation);
      });

      if (sprite.filename !== NO_SPRITE_FILENAME) {
        compilation.assets[sprite.filename] = {
          source: () => sprite.content,
          size: () => sprite.content.length
        };
      }
    });
  }
}

module.exports = ExtractSvgSpritePlugin;
