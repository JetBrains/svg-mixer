/* eslint-disable new-cap,arrow-body-style */
const Promise = require('bluebird');
const merge = require('merge-options');

const Sprite = require('./sprite');
const SpriteSymbol = require('./symbol');
const { getBasename, glob, createImageFromFile } = require('./utils');

class Compiler {
  /**
   * @typedef {Object} CompilerConfig
   * @property {SpriteConfig|StackSpriteConfig} spriteConfig
   * @property {Sprite|StackSprite} spriteClass
   * @property {SpriteSymbol} symbolClass
   * @property {function(path: string)} generateSymbolId
   * @return {CompilerConfig}
   */
  static get defaultConfig() {
    return {
      spriteConfig: {},
      spriteClass: Sprite,
      symbolClass: SpriteSymbol,
      generateSymbolId: path => getBasename(path)
    };
  }

  /**
   * @param {CompilerConfig} config
   */
  constructor(config = {}) {
    /** @type CompilerConfig */
    this.config = merge(this.constructor.defaultConfig, config);
    this.symbols = [];
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
    const { spriteClass, spriteConfig } = this.config;
    const sprite = new spriteClass(spriteConfig, this.symbols);
    return Promise.resolve(sprite);
  }
}

module.exports = Compiler;
