const merge = require('merge-options');

const BaseSprite = require('./base-sprite');
const {
  createSprite,
  formatNumber,
  CssValue
} = require('./utils');

class Sprite extends BaseSprite {
  /**
   * @return {{filename: string, gap: number, usages: boolean}}
   */
  static get defaultConfig() {
    return merge(super.defaultConfig, {
      gap: 10,
      usages: true
    });
  }

  get height() {
    const { symbols, config } = this;
    const gaps = symbols.length
      ? (symbols.length - 1) * config.gap
      : 0;
    return super.height + gaps;
  }

  /**
   * Generate data for image positioning and scaling on sprite canvas. All returned values are percentages.
   * @param {SpriteSymbol} symbol
   * @return {{aspectRatio: number, width: number, height: number, topPos: number, bgPosition: number}}
   */
  calculateSymbolPosition(symbol) {
    const { height: spriteHeight, config } = this;
    const { image } = symbol;
    const { height: imgHeight } = image;
    const images = this.symbols.map(s => s.image);

    const { width, height, aspectRatio } = super.calculateSymbolPosition(symbol);

    const portion = images.slice(0, images.indexOf(image));
    const heights = portion.map(img => img.height).reduce((sum, h) => sum + h, 0);
    const y = heights + (portion.length * config.gap);
    const topPos = y / spriteHeight;
    const bgYPosition = y / (spriteHeight - imgHeight);

    // https://teamtreehouse.com/community/what-happened-when-set-backgroundposition-20-50
    // https://www.w3.org/TR/css-backgrounds-3/#the-background-position

    return {
      width,
      height,
      aspectRatio,
      topPos: new CssValue(topPos, 'px'),
      bgYPosition: new CssValue(bgYPosition, '%')
    };
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    const { width, height, config } = this;

    const symbols = Promise.all(this.symbols.map(s => s.generate()));

    let usages;
    if (config.usages) {
      usages = Promise.all(this.symbols.map(s => {
        const { topPos } = this.calculateSymbolPosition(s);
        return s.createUsage({ transform: `translate(0, ${topPos})` });
      }));
    }

    // eslint-disable-next-line no-shadow
    return Promise.all([symbols, usages]).then(([symbols, usages]) => createSprite({
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
      const { aspectRatio, width, height, bgPosition } = this.calculateSymbolPosition(s);
      return `
.${s.id} {
  position: relative;
}

.${s.id}:before {
  display: block;
  padding-bottom: ${formatNumber(aspectRatio)}%;
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
  background: url('_sprite.svg') no-repeat 0 ${formatNumber(bgPosition)}%;
  background-size: ${formatNumber(width)}% ${formatNumber(height)}%;
  content: '';
}
`;
    });

    return Promise.resolve(css.join('\n\n'));
  }
}

module.exports = Sprite;
