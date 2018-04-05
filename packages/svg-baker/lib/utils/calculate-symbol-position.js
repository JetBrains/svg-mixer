const { create: spriteValue } = require('../sprite-value');

/**
 * @typedef {Object} SpriteSymbolPosition
 * @property {SpriteValue} width
 * @property {SpriteValue} height
 * @property {SpriteValue} aspectRatio
 * @property {SpriteValue} left
 * @property {SpriteValue} top
 * @property {Object} bgSize
 * @property {SpriteValue} bgSize.width
 * @property {SpriteValue} bgSize.height
 * @property {Object} bgPosition
 * @property {SpriteValue} bgPosition.left
 * @property {SpriteValue} bgPosition.top
 */

/**
 * @enum
 */
const FORMAT_TYPE = {
  px: 'toPx',
  percent: 'toPercent'
};

/**
 * @param {SpriteValue} val
 * @param {FORMAT_TYPE} type
 * @return {string|SpriteValue}
 */
function formatVal(val, type) {
  const formatMethod = FORMAT_TYPE[type];
  return formatMethod ? val[formatMethod]() : val;
}

/**
 * Generate data for image positioning and scaling on sprite canvas.
 * @param {SpriteSymbol} symbol
 * @param {Sprite} sprite
 * @param {FORMAT_TYPE|false} [format=false] false | 'px' | 'percent'
 * @return {SpriteSymbolPosition}
 */
module.exports = function calculateSymbolPosition(symbol, sprite, format = false) {
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
    beforeSymbols.length * config.spacing;

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
    width: formatVal(width, format),
    height: formatVal(height, format),
    aspectRatio: formatVal(aspectRatio, format),
    left: formatVal(left, format),
    top: formatVal(top, format),
    bgSize: {
      width: formatVal(desiredWidth, format),
      height: formatVal(desiredHeight, format)
    },
    bgPosition: {
      left: formatVal(bgLeftPosition, format),
      top: formatVal(bgTopPosition, format)
    }
  };
};
