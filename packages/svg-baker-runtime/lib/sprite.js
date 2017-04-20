import { namespaces, objectToAttrsString } from './utils';

export default class Sprite {
  /**
   * @param {SpriteSymbol[]} [symbols]
   */
  constructor(symbols = []) {
    this.symbols = symbols;
  }

  /**
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
      console.log(symbol.destroy.toString());
      symbols.splice(symbols.indexOf(symbol), 1);
      symbol.destroy();
    }
  }

  /**
   * @param {string} id
   * @return {SpriteSymbol}
   */
  find(id) {
    return this.symbols.filter(s => s.id === id)[0];
  }

  /**
   * @param {string} id
   * @return {boolean}
   */
  has(id) {
    return !!this.find(id);
  }

  toString() {
    const { svg, xlink } = namespaces;

    const attrs = {
      [svg.name]: svg.value,
      [xlink.name]: xlink.value,
      style: ['position: absolute', 'width: 0', 'height: 0'].join('; ')
    };

    const attrsRendered = objectToAttrsString(attrs);
    const symbolsRendered = this.symbols.map(s => s.toString());

    return `<svg ${attrsRendered}>${symbolsRendered}</svg>`;
  }
}
