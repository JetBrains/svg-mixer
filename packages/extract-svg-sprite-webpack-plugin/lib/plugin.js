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
 * @property {string|function} symbolId='[name]'
 * @property {string|function} filename='sprite.svg'
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

  static extractFromCss() {
    return { loader: CSS_LOADER_PATH };
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
    this.compiler = new SpriteCompiler();
  }

  get NAMESPACE() {
    return NAMESPACE;
  }

  addSymbol(symbol) {
    this.compiler.set(symbol.id, symbol);
  }

  apply(compiler) {
    let prevResult;

    compiler.plugin('compilation', compilation => {
      compilation.plugin('normal-module-loader', loaderContext => {
        loaderContext[NAMESPACE] = this;
      });

      compilation.plugin('additional-assets', done => {
        // TODO refactor this hacky way to work with extract-text-webpack-plugin
        (prevResult
          ? Promise.resolve(prevResult)
          : this.compile()
        ).then(sprites => {
          prevResult = sprites;

          sprites.forEach(sprite => {
            sprite.symbols.forEach(s => {
              Replacer.replaceInModuleSource(s.module, s.replacements);
              Replacer.replaceInModuleSource(s.module.issuer, s.replacements);
            });

            if (sprite.filename !== NO_SPRITE_FILENAME) {
              compilation.assets[sprite.filename] = {
                source: () => sprite.content,
                size: () => sprite.content.length
              };
            }
          });
          done();
        });
      });
    });
  }

  compile() {
    return this.compiler.compile(this.config);
  }
}

module.exports = ExtractSvgSpritePlugin;
