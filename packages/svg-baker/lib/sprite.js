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
   * @return {{filename: string, gap: number, usages: boolean}}
   */
  static get defaultConfig() {
    return {
      filename: 'sprite.svg',
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
        transform: `translate(0, ${calculateSymbolPosition(s, this).top})`
      }));
    }

    return Promise.all(symbols.map(s => s.generate()))
      .then(symbolsTree => createSpriteTree({
        attrs: { width, height },
        symbols: symbolsTree,
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
    const css = this.symbols.map(s => {
      const pos = calculateSymbolPosition(s, this);
      const aspectRatio = pos.aspectRatio.toPercent();
      const bgPosLeft = pos.bgPosition.left.toPercent();
      const bgPosTop = pos.bgPosition.top.toPercent();
      const bgSizeWidth = pos.bgSize.width.toPercent();
      const bgSizeHeight = pos.bgSize.height.toPercent();

      return `
.${s.id} {
  position: relative;
}

.${s.id}:before {
  display: block;
  padding-bottom: ${aspectRatio};
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
  background: url('_sprite.svg') no-repeat ${bgPosLeft} ${bgPosTop};
  background-size: ${bgSizeWidth} ${bgSizeHeight};
  content: '';
}
`;
    });

    return Promise.resolve(css.join('\n\n'));
  }
}

module.exports = Sprite;
