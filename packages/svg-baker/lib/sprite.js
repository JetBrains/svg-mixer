const Promise = require('bluebird');

const AbstractSprite = require('./abstract-sprite');
const {
  arraySum,
  calculateImgTopPosition,
  createSymbolFromImage,
  createSprite
} = require('./utils');

const IMAGE_GAP = 10;

class Sprite extends AbstractSprite {
  get width() {
    const { images } = this;
    return images.length ? Math.max(...images.map(img => img.width)) : 0;
  }

  get height() {
    const { images } = this;
    const heights = arraySum(images.map(img => img.height));
    const gaps = images.length
      ? (images.length - 1) * IMAGE_GAP
      : 0;
    return heights + gaps;
  }

  /**
   * @param contentOrOpts {@see AbstractSprite.add}
   * @return {Promise<Image>}
   */
  addFromFile(contentOrOpts) {
    const { images } = this;
    return super.addFromFile(contentOrOpts).then(img => {
      const y = calculateImgTopPosition(img, images, IMAGE_GAP);
      img.coords = { x: 0, y };
      return img;
    });
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
