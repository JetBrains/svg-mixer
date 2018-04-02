const merge = require('merge-options');

const {
  createSpriteTree,
  calculateSymbolPosition
} = require('./utils');

class Sprite {
  /**
   * @param {Object} [config]
   * @param {Array<SpriteSymbol>} [symbols]
   */
  constructor(config = {}, symbols) {
    this.config = merge(this.constructor.defaultConfig, config);
    this.symbols = symbols || [];
  }

  /**
   * @return {{filename: string, attrs: Object, usages: boolean, gap: number}}
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
    const symbolsHeight = this.symbols
      .map(({ image }) => image.height)
      .reduce((sum, height) => sum + height, 0);

    return symbolsHeight + (symbols.length * config.gap);
  }

  /**
   * @param {SpriteSymbol} symbol
   * @return {SpriteSymbol}
   */
  addSymbol(symbol) {
    this.symbols.push(symbol);
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    const { width, height, config, symbols } = this;

    let usagesTree;
    if (config.usages) {
      usagesTree = symbols.map(s => s.createUsage({
        width: s.width,
        height: s.height,
        transform: `translate(0, ${calculateSymbolPosition(s, this).top})`
      }));
    }

    return Promise.all(symbols.map(s => s.generate()))
      .then(symbolsTrees => createSpriteTree({
        attrs: merge(config.attrs, { viewBox: `0 0 ${width} ${height}` }),
        symbols: symbolsTrees,
        usages: usagesTree
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
  right: 0;
  bottom: 0;
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
