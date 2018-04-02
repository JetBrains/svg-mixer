const merge = require('merge-options');

const {
  createSprite,
  SpriteValue
} = require('./utils');


const { create: spriteValue } = SpriteValue;

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
   * Generate data for image positioning and scaling on sprite canvas.
   * @param {SpriteSymbol} symbol
   * @return {{
   *   width: SpriteValue,
   *   height: SpriteValue,
   *   aspectRatio: SpriteValue,
   *   left: SpriteValue,
   *   top: SpriteValue,
   *   bgSize: {
   *     width: SpriteValue,
   *     height: SpriteValue
   *   },
   *   bgPosition: {
   *     left: SpriteValue,
   *     top: SpriteValue
   *   }
   * }}
   */
  calculatePosition(symbol) {
    const { width: spriteWidth, height: spriteHeight, symbols, config } = this;
    const { width: symbolWidth, height: symbolHeight } = symbol;

    const width = spriteValue(symbolWidth, spriteWidth);
    const height = spriteValue(symbolHeight, spriteHeight);
    const aspectRatio = spriteValue(symbolHeight, symbolWidth);

    /**
     * How much symbol should be stretched to fit 100% sprite canvas, i.e background-size in CSS
     */
    const desiredWidth = spriteValue(symbolWidth * (spriteWidth / symbolWidth), symbolWidth);
    const desiredHeight = spriteValue(symbolHeight * (spriteHeight / symbolHeight), symbolHeight);

    const beforeSymbols = symbols.slice(0, symbols.indexOf(symbol));
    const beforeSymbolsHeight =
      beforeSymbols.map(s => s.height).reduce((sum, h) => sum + h, 0) +
      beforeSymbols.length * config.gap;

    const left = spriteValue(0, spriteWidth);
    const top = spriteValue((beforeSymbolsHeight / spriteHeight) * spriteHeight, spriteHeight);

    /**
     * @see https://teamtreehouse.com/community/what-happened-when-set-backgroundposition-20-50
     * @see https://www.w3.org/TR/css-backgrounds-3/#the-background-position
     */
    const bgLeftPosition = spriteValue(0, spriteWidth);
    const bgTopPosition = spriteValue(
      beforeSymbolsHeight / (spriteHeight - symbolHeight) * spriteHeight,
      spriteHeight
    );

    return {
      width,
      height,
      aspectRatio,
      left,
      top,
      bgSize: {
        width: desiredWidth,
        height: desiredHeight
      },
      bgPosition: {
        left: bgLeftPosition,
        top: bgTopPosition
      }
    };
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    const { width, height, config, symbols } = this;

    const symbolsTree = Promise.all(symbols.map(s => s.generate()));

    let usagesTree;
    if (config.usages) {
      usagesTree = symbols.map(s => s.createUsage({
        transform: `translate(0, ${this.calculatePosition(s).top})`
      }));
    }

    // eslint-disable-next-line no-shadow
    return Promise.all([symbolsTree, usagesTree]).then(([symbols, usages]) => createSprite({
      attrs: { width, height },
      symbols,
      usages
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
      const pos = this.calculatePosition(s);
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
