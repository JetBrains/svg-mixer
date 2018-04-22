const merge = require('merge-options');
const pretty = require('pretty');

const SpriteSymbolsMap = require('./sprite-symbols-map');

const {
  generateSpriteTree,
  calculateSymbolPosition
} = require('./utils');

class Sprite {
  /**
   * @typedef {Object} SpriteConfig
   * @property {string} filename
   * @property {Object} attrs
   * @property {boolean} usages
   * @property {number} spacing
   * @return {SpriteConfig}
   */
  static get defaultConfig() {
    return {
      filename: 'sprite.svg',
      attrs: {},
      usages: true,
      spacing: 10
    };
  }

  static get TYPE() {
    return 'classic';
  }

  /**
   * @param {SpriteConfig} [config]
   * @param {Array<SpriteSymbol>} [symbols]
   */
  constructor(config, symbols) {
    this.config = merge(this.constructor.defaultConfig, config);
    this._symbols = new SpriteSymbolsMap(symbols);
  }

  /**
   * @return {number}
   */
  get width() {
    const { symbols } = this;
    return symbols.length ? Math.max(...symbols.map(s => s.width)) : 0;
  }

  /**
   * @return {number}
   */
  get height() {
    const { symbols, config } = this;
    const symbolsHeight = symbols
      .map(({ image }) => image.height)
      .reduce((sum, height) => sum + height, 0);

    return symbolsHeight + (symbols.length * config.spacing);
  }

  /**
   * @return {Array<SpriteSymbol>}
   */
  get symbols() {
    return this._symbols.toArray();
  }

  /**
   * @param {SpriteSymbol} symbol
   * @return {SpriteSymbol}
   */
  addSymbol(symbol) {
    this._symbols.add(symbol);
  }

  /**
   * @param {SpriteSymbol} symbol
   * @param {boolean|string} [format] false | 'px' | 'percent'
   * @return {SpriteSymbolPosition}
   */
  calculateSymbolPosition(symbol, format) {
    return calculateSymbolPosition(symbol, this, format);
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    const { width, height, config, symbols } = this;

    let usagesTrees;
    if (config.usages) {
      usagesTrees = symbols.map(s => ({
        tag: 'use',
        attrs: {
          width: s.width,
          height: s.height,
          'xlink:href': `#${s.id}`,
          transform: `translate(0, ${calculateSymbolPosition(s, this).top})`
        }
      }));
    }

    return Promise.all(symbols.map(s => s.generate()))
      .then(symbolsTrees => generateSpriteTree({
        attrs: merge(config.attrs, { width, height }),
        defs: symbolsTrees,
        content: usagesTrees
      }));
  }

  /**
   * @param {boolean} prettify
   * @return {Promise<string>}
   */
  render(prettify = false) {
    // eslint-disable-next-line no-confusing-arrow
    return this.generate().then(tree =>
      prettify ? pretty(tree.toString()) : tree.toString()
    );
  }
}

module.exports = Sprite;
