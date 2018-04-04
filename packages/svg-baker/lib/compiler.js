/* eslint-disable new-cap */
const Promise = require('bluebird');
const merge = require('merge-options');

const Sprite = require('./sprite');
const StackSprite = require('./stack-sprite');
const SpriteSymbol = require('./sprite-symbol');
const { glob, createImageFromFile, getBasename } = require('./utils');

class Compiler {
  /**
   * @typedef {Object} CompilerConfig
   * @property {string} mode 'default' | 'stack'
   * @property {SpriteConfig|StackSpriteConfig} spriteConfig
   * @property {Sprite|StackSprite} spriteClass
   * @property {SpriteSymbol} symbolClass
   * @property {function(path: string)} generateSymbolId
   */
  static get defaultConfig() {
    return {
      mode: 'default',
      spriteConfig: {},
      spriteClass: Sprite,
      symbolClass: SpriteSymbol,
      generateSymbolId: path => getBasename(path)
    };
  }

  /**
   * @param {CompilerConfig} [config]
   */
  constructor(config = {}) {
    this.symbols = [];

    const cfg = merge(this.constructor.defaultConfig, config);
    switch (cfg.mode) {
      default:
      case 'default':
        cfg.spriteClass = Sprite;
        break;

      case 'stack':
        cfg.spriteClass = StackSprite;
        break;
    }

    /** @type CompilerConfig */
    this.config = cfg;
  }

  /**
   * @param {string|Array<string>} files Glob pattern or absolute path or array of them
   * @return {Promise<SpriteSymbol>}
   */
  add(files) {
    const { symbolClass, generateSymbolId: generateId } = this.config;

    return glob(files)
      .then(paths => Promise.map(paths, path => createImageFromFile(path)))
      .then(images => images.map(img => new symbolClass(generateId(img.path), img)))
      .then(symbols => {
        this.symbols = this.symbols.concat(symbols);
        return symbols;
      });
  }

  /**
   * @returns {Promise<Sprite>}
   */
  compile() {
    const { spriteClass, spriteConfig } = this.config;
    const sprite = new spriteClass(spriteConfig, this.symbols);
    return Promise.resolve(sprite);
  }
}

module.exports = Compiler;
