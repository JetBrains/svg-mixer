const Image = require('./image');
const { createImageFromFile } = require('./utils');

/**
 * @abstract
 */
class AbstractSprite {
  constructor() {
    this.images = [];
  }

  /**
   * @return {number}
   */
  get width() {
    return 0;
  }

  /**
   * @return {number}
   */
  get height() {
    return 0;
  }

  /**
   * @param {string|{content: string, id: string}} contentOrOpts
   * @return {Image}
   */
  add(contentOrOpts) {
    const img = new Image(contentOrOpts);
    this.images.push(img);
    return img;
  }

  /**
   * @param {string|{path: string, id: string}} pathOrOpts
   * @return {Promise<Image>}
   */
  addFromFile(pathOrOpts) {
    return createImageFromFile(pathOrOpts).then(img => {
      this.images.push(img);
      return img;
    });
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
