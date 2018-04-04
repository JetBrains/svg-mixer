const merge = require('merge-options');

const SymbolsMap = require('./symbols-map');

const {
  generateSpriteTree,
  calculateSymbolPosition,
  createSymbolFromFile
} = require('./utils');

class Sprite {
  /**
   * @typedef {Object} SpriteConfig
   * @property {string} filename
   * @property {Object} attrs
   * @property {boolean} usages
   * @property {number} gap
   * @return {SpriteConfig}
   */
  static get defaultConfig() {
    return {
      filename: 'sprite.svg',
      attrs: {},
      usages: true,
      gap: 10
    };
  }

  /**
   * @param {SpriteConfig} [config]
   * @param {Array<SpriteSymbol>} [symbols]
   */
  constructor(config, symbols) {
    this.config = merge(this.constructor.defaultConfig, config);
    this._symbols = new SymbolsMap(symbols);
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

    return symbolsHeight + (symbols.length * config.gap);
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
   * @param {string} id
   * @param {string} path
   * @return {Promise<SpriteSymbol>}
   */
  addSymbolFromFile(id, path) {
    return createSymbolFromFile(id, path).then(s => this.addSymbol(s));
  }

  calculateSymbolPosition(symbol) {
    return calculateSymbolPosition(symbol);
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
   * @return {Promise<string>}
   */
  render() {
    return this.generate().then(tree => tree.toString());
  }

  renderCss() {
    const { filename } = this.config;

    const css = this.symbols.map(s => {
      const { aspectRatio, bgSize, bgPosition } = calculateSymbolPosition(s, this);
      const { width, height } = bgSize;
      const { top, left } = bgPosition;

      return `
.${s.id} {
  position: relative;
}

.${s.id}:before {
  display: block;
  padding-bottom: ${aspectRatio.toPercent()};
  box-sizing: content-box;
  content: '';
}

.${s.id}:after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('${filename}') no-repeat ${left.toPercent()} ${top.toPercent()};
  background-size: ${width.toPercent()} ${height.toPercent()};
  content: '';
}
`;
    }).join('\n\n');

    return Promise.resolve(css);
  }
}

module.exports = Sprite;
