import merge from 'deepmerge';
import wrapInSvgString from './utils/wrap-in-svg-string';
import defaultConfig from './sprite.config';

export default class Sprite {
  /**
   * @param {Object} [config]
   */
  constructor(config) {
    this.config = merge(defaultConfig, config || {});
    this.symbols = [];
  }

  /**
   * TODO return add | replace instead of symbol instance
   * @param {SpriteSymbol} symbol
   * @return {SpriteSymbol}
   */
  add(symbol) {
    const { symbols } = this;
    const existing = this.find(symbol.id);

    if (existing) {
      symbols[symbols.indexOf(existing)] = symbol;
      return symbol;
    }

    symbols.push(symbol);
    return symbol;
  }

  /**
   * Remove from list & destroy symbol
   * @param {string} id
   */
  remove(id) {
    const { symbols } = this;
    const symbol = this.find(id);

    if (symbol) {
      symbols.splice(symbols.indexOf(symbol), 1);
      symbol.destroy();
    }
  }

  /**
   * @param {string} id
   * @return {SpriteSymbol|null}
   */
  find(id) {
    return this.symbols.filter(s => s.id === id)[0] || null;
  }

  /**
   * @param {string} id
   * @return {boolean}
   */
  has(id) {
    return this.find(id) !== null;
  }

  /**
   * @return {string}
   */
  stringify() {
    const { attrs } = this.config;
    const stringifiedSymbols = this.symbols.map(s => s.stringify()).join('');
    return wrapInSvgString(stringifiedSymbols, attrs);
  }

  /**
   * @return {string}
   */
  toString() {
    return this.stringify();
  }
}
