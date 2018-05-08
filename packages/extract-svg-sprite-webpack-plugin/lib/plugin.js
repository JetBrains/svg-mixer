/* eslint-disable new-cap,no-param-reassign */
const merge = require('merge-options');
const mixer = require('svg-mixer');
const Chunk = require('webpack/lib/Chunk');

const SpriteCompiler = require('./compiler');
const {
  NAMESPACE,
  LOADER_PATH,
  CSS_LOADER_PATH,
  NO_SPRITE_FILENAME
} = require('./config');
const Replacer = require('./replacer');

const defaultConfig = {
  symbolId: '[name]',
  filename: 'sprite.svg',
  chunkFilename: '[name]-[hash].svg',
  emit: true,
  selector: null,
  symbolClass: mixer.SpriteSymbol,
  spriteType: mixer.Sprite.TYPE,
  spriteClass: mixer.Sprite
};

let INSTANCE_COUNTER = 0;

class SvgSpritePlugin {
  constructor(cfg) {
    this.id = ++INSTANCE_COUNTER;
    const config = merge(defaultConfig, cfg || {});

    switch (config.spriteType) {
      default:
      case mixer.Sprite.TYPE:
        config.spriteClass = mixer.Sprite;
        break;

      case mixer.StackSprite.TYPE:
        config.spriteClass = mixer.StackSprite;
        break;
    }

    this.config = config;
    this.compiler = new SpriteCompiler();
  }

  static extract(options) {
    return { loader: LOADER_PATH, options };
  }

  static extractFromCss() {
    return { loader: CSS_LOADER_PATH };
  }

  get NAMESPACE() {
    return NAMESPACE;
  }

  extract(options) {
    return SvgSpritePlugin.extract(options);
  }

  extractFromCss() {
    return SvgSpritePlugin.extractFromCss();
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

      compilation.plugin('webpack-manifest-plugin-after-emit', (manifest, callback) => {
        callback();
      });
    });
  }

  compile() {
    return this.compiler.compile(this.config);
  }
}

module.exports = SvgSpritePlugin;
