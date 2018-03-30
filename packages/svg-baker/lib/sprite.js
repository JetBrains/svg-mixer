const Promise = require('bluebird');
const merge = require('merge-options');

const AbstractSprite = require('./abstract-sprite');
const {
  arraySum,
  calculateImgSizeToFitViewport,
  calculateImgTopPosition,
  convertPxToBgPositionPercent,
  createSymbolFromImage,
  createSprite
} = require('./utils');

const defaultConfig = {
  gap: 10
};

class Sprite extends AbstractSprite {
  constructor(config) {
    super();
    this.config = merge(defaultConfig, config);
  }

  get width() {
    const { images } = this;
    return images.length ? Math.max(...images.map(img => img.width)) : 0;
  }

  get height() {
    const { images, config } = this;
    const heights = arraySum(images.map(img => img.height));
    const gaps = images.length
      ? (images.length - 1) * config.gap
      : 0;
    return heights + gaps;
  }

  /**
   * @param contentOrOpts {@see AbstractSprite.addFromFile}
   * @return {Promise<Image>}
   */
  addFromFile(contentOrOpts) {
    const { images, config } = this;
    return super.addFromFile(contentOrOpts).then(img => {
      const y = calculateImgTopPosition(img, images, config.gap);
      img.coords = { x: 0, y };
      return img;
    });
  }

  /**
   * Generate data for proper symbol positioning and scaling on sprite canvas.
   * All returned values are percentages.
   * @param {Image} img
   * @return {{aspectRatio: number, width, height, topPos: number, bgPosition: number}}
   */
  generatePositioningData(img) {
    const { width: spriteWidth, height: spriteHeight } = this;
    const { width: imgWidth, height: imgHeight } = img;

    const { width, height } = calculateImgSizeToFitViewport(
      spriteWidth,
      spriteHeight,
      imgWidth,
      imgHeight
    );

    const topPos = (img.coords.y / spriteHeight) * 100;
    const aspectRatio = (imgHeight / imgWidth) * 100;

    // https://teamtreehouse.com/community/what-happened-when-set-backgroundposition-20-50
    // https://www.w3.org/TR/css-backgrounds-3/#the-background-position
    const bgPosition = img.coords.y / (spriteHeight - imgHeight) * 100;

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

        const usages = images.map(({ id, width, height, coords }) => ({
          tag: 'use',
          attrs: {
            'xlink:href': `#${id}`,
            width,
            height,
            transform: `translate(${coords.x}, ${coords.y})`
          }
        }));

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
