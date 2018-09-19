const generateSymbolTree = require('./utils/generate-symbol-tree');
const Image = require('./image');

class SpriteSymbol {
  /**
   * @param {string} id
   * @param {string} path
   * @return {Promise<SpriteSymbol>}
   */
  static fromFile(id, path) {
    return Image.fromFile(path).then(img => new SpriteSymbol(id, img));
  }

  /**
   * @param {string} id
   * @param {Image} image
   */
  constructor(id, image) {
    this.id = id;
    this.image = image;
  }

  /**
   * @return {number}
   */
  get width() {
    return this.image.width;
  }

  /**
   * @return {number}
   */
  get height() {
    return this.image.height;
  }

  /**
   * @return {Array<number>}
   */
  get viewBox() {
    return this.image.viewBox;
  }

  /**
   * @return {string}
   */
  get request() {
    const { path, query } = this.image;
    return path + query;
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    return generateSymbolTree(this);
  }

  /**
   * @return {Promise<string>}
   */
  render() {
    return this.generate().then(tree => tree.toString());
  }

}

module.exports = SpriteSymbol;
