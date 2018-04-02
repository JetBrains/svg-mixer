/* eslint-disable new-cap,arrow-body-style */
const Promise = require('bluebird');
const merge = require('merge-options');

const Sprite = require('./sprite');
const StackSprite = require('./stack-sprite');
const SpriteSymbol = require('./symbol');
const {
  getBasename,
  glob,
  createImageFromFile
} = require('./utils');

/**
 * @typedef {Object} CompilerConfig
 * @property {string} mode 'default' | 'stack'
 * @property {Object} sprite {@see Sprite.defaultConfig}
 * @property {Sprite|StackSprite} spriteClass
 * @property {SpriteSymbol} symbolClass
 * @property {function(path: string)} generateSymbolId
 */

class Compiler {
  /**
   * @param {CompilerConfig} config
   */
  constructor(config = {}) {
    const cfg = merge(this.constructor.defaultConfig, config);

    switch (cfg.mode) {
      case 'default':
      default:
        cfg.spriteClass = Sprite;
        break;

      case 'stack':
        cfg.spriteClass = StackSprite;
        break;
    }

    /** @type CompilerConfig */
    this.config = cfg;
    this.symbols = [];
  }

  /**
   * @return {CompilerConfig}
   */
  static get defaultConfig() {
    return {
      mode: 'default',
      sprite: {},
      spriteClass: Sprite,
      symbolClass: SpriteSymbol,
      generateSymbolId: path => getBasename(path)
    };
  }

  /**
   * @param {string} globPattern
   * @param {CompilerConfig} config
   * @return {Promise<Sprite>}
   */
  static createSpriteFromFiles(globPattern, config = {}) {
    const compiler = new Compiler(config);
    return compiler.addSymbolsFromFiles(globPattern).then(() => compiler.compile());
  }

  /**
   * @param config
   * @return {Compiler}
   */
  static create(config) {
    return new Compiler(config);
  }

  /**
   * @param {SpriteSymbol} symbol
   * @return {SpriteSymbol}
   */
  addSymbol(symbol) {
    function comparator(left, right) {
      const leftId = left.id;
      const rightId = right.id;

      if (leftId === rightId) {
        return 0;
      }
      return leftId < rightId ? -1 : 1;
    }

    this.symbols.push(symbol);
    this.symbols.sort(comparator);

    return symbol;
  }

  /**
   * @param {string} path
   * @return {Promise<SpriteSymbol>}
   */
  addSymbolFromFile(path) {
    return createImageFromFile(path)
      .then(image => new SpriteSymbol(this.config.generateSymbolId(path), image))
      .then(symbol => this.addSymbol(symbol));
  }

  /**
   * @param {string} globPattern
   * @return {Promise<SpriteSymbol[]>}
   */
  addSymbolsFromFiles(globPattern) {
    return glob(globPattern)
      .then(paths => Promise.map(paths, path => this.addSymbolFromFile(path)));
  }

  /**
   * @return {Promise<Sprite>}
   */
  compile() {
    const { spriteClass, sprite: spriteConfig } = this.config;
    const sprite = new spriteClass(spriteConfig, this.symbols);
    return Promise.resolve(sprite);
  }
}

module.exports = Compiler;
