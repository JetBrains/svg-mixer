const generateSymbolTree = require('./utils/generate-symbol-tree');

class SpriteSymbol {
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
   * @return {number}
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
