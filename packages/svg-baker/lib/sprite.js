const Promise = require('bluebird');

const AbstractSprite = require('./abstract-sprite');
const {
  calculateImgSizeToFitViewport,
  calculateImgTopPosition,
  createSymbolFromImage,
  createSymbolUsage,
  createSprite
} = require('./utils');

class Sprite extends AbstractSprite {
  static get defaultConfig() {
    return {
      gap: 10
    };
  }

  get height() {
    const { images, config } = this;
    const gaps = images.length
      ? (images.length - 1) * config.gap
      : 0;
    return super.height + gaps;
  }

  /**
   * Generate data for symbol positioning and scaling on sprite canvas.
   * All returned values are percentages.
   * @param {Image} img
   * @return {{aspectRatio: number, width: number, height: number, topPos: number, bgPosition: number}}
   */
  calculatePositionData(img) {
    const { width: spriteWidth, height: spriteHeight } = this;
    const { width: imgWidth, height: imgHeight } = img;

    const y = calculateImgTopPosition(img, this.images, this.config.gap);
    const { width, height } = calculateImgSizeToFitViewport(
      spriteWidth,
      spriteHeight,
      imgWidth,
      imgHeight
    );

    const topPos = (y / spriteHeight) * 100;
    const aspectRatio = (imgHeight / imgWidth) * 100;

    // https://teamtreehouse.com/community/what-happened-when-set-backgroundposition-20-50
    // https://www.w3.org/TR/css-backgrounds-3/#the-background-position
    const bgPosition = y / (spriteHeight - imgHeight) * 100;

    return {
      width,
      height,
      topPos,
      bgPosition,
      aspectRatio
    };
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    const { images } = this;

    return Promise
      .map(images, img => createSymbolFromImage(img))
      .then(symbols => createSprite({ symbols }))
      .then(spriteTree => {
        const { root } = spriteTree;

        const usages = images.map(img => {
          const y = calculateImgTopPosition(img, this.images, this.config.gap);
          return createSymbolUsage(img, { transform: `translate(0, ${y})` });
        });

        root.content = root.content.concat(usages);
        root.attrs.width = this.width;
        root.attrs.height = this.height;

        return spriteTree;
      });
  }

  /**
   * @return {Promise<string>}
   */
  render() {
    return this.generate().then(tree => tree.toString());
  }
}

module.exports = Sprite;
