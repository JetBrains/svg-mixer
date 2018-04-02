const { create: spriteValue } = require('../sprite-value');

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
module.exports = function calculateSymbolPosition(symbol, sprite) {
  const { width: spriteWidth, height: spriteHeight, symbols, config } = sprite;
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
};
