const merge = require('merge-options');

const Image = require('./image');
const { createImageFromFile } = require('./utils');

/**
 * @abstract
 */
class AbstractSprite {
  /**
   * @param {Array<Image>} [images]
   * @param {Object} [config]
   */
  constructor(images = [], config = {}) {
    this.images = images;
    this.config = merge(this.constructor.defaultConfig, config);
  }

  static get defaultConfig() {
    return {};
  }

  /**
   * @return {number}
   */
  get width() {
    const { images } = this;
    return images.length ? Math.max(...images.map(img => img.width)) : 0;
  }

  /**
   * @return {number}
   */
  get height() {
    return this.images
      .map(img => img.height)
      .reduce((sum, height) => sum + height, 0);
  }

  /**
   * @param {Image|string|{content: string, id: string}} input
   * @return {Image}
   */
  add(input) {
    const img = input instanceof Image ? input : new Image(input);
    this.images.push(img);
    return img;
  }

  /**
   * @param {string|{path: string, id: string}} pathOrOpts
   * @return {Promise<Image>}
   */
  addFromFile(pathOrOpts) {
    return createImageFromFile(pathOrOpts).then(img => this.add(img));
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    throw new Error('Should be implemented in child class');
  }

  /**
   * @return {Promise<string>}
   */
  render() {
    throw new Error('Should be implemented in child class');
  }
}

module.exports = AbstractSprite;
