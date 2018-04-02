const merge = require('merge-options');

const notImplException = () => new Error('Should be implemented in child class');

const { SpriteValue } = require('./utils');

const { create: spriteValue } = SpriteValue;

/**
 * @abstract
 */
class BaseSprite {
  /**
   * @param {Object} [config]
   * @param {Array<SpriteSymbol>} [symbols]
   */
  constructor(config = {}, symbols) {
    this.config = merge(this.constructor.defaultConfig, config);
    this.symbols = symbols || [];
  }

  static get defaultConfig() {
    return {
      filename: 'sprite.svg'
    };
  }

  /**
   * @return {number}
   */
  get width() {
    const { symbols } = this;
    return symbols.length ? Math.max(...symbols.map(({ image }) => image.width)) : 0;
  }

  /**
   * @return {number}
   */
  get height() {
    return this.symbols
      .map(({ image }) => image.height)
      .reduce((sum, height) => sum + height, 0);
  }

  /**
   * @param {SpriteSymbol} symbol
   * @return {SpriteSymbol}
   */
  addSymbol(symbol) {
    this.symbols.push(symbol);
  }

  /**
   * Generate data for image positioning and scaling on sprite canvas. All returned values are percentages.
   * @param {SpriteSymbol} symbol
   * @return {{width: number, height: number, aspectRatio: number}}
   */
  calculateSymbolPosition(symbol) {
    const { width: spriteWidth, height: spriteHeight } = this;
    const { width: symbolWidth, height: symbolHeight } = symbol;

    const width = this.width / symbolWidth;
    const height = this.height / symbolHeight;
    const aspectRatio = symbolHeight / symbolWidth;

    const w = spriteValue(symbolWidth, spriteWidth);
    const h = spriteValue(symbolHeight, spriteHeight);
    const desiredWidth = spriteValue(symbolWidth * (spriteWidth / symbolWidth), symbolWidth);
    const desiredHeight = spriteValue(symbolHeight * (spriteHeight / symbolHeight), symbolHeight);
    const ratio = spriteValue(symbolHeight, symbolWidth);

    debugger;

    const bgSize = {
      x: spriteValue(spriteWidth / symbolWidth, spriteWidth),
      y: spriteValue(spriteHeight / symbolHeight, spriteHeight)
    };



    return {
      width: spriteValue(this.width / symbolWidth, '%'),
      height: spriteValue(this.height / symbolHeight, '%'),
      aspectRatio: spriteValue(symbolHeight / symbolWidth, '%')
    };
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    throw notImplException();
  }

  /**
   * @return {postcss.LazyResult}
   */
  generateCss() {
    throw notImplException();
  }

  /**
   * @return {Promise<string>}
   */
  render() {
    throw notImplException();
  }

  /**
   * @return {Pr}
   */
  renderCss() {
    throw notImplException();
  }
}

module.exports = BaseSprite;
