const { parse: parseSvg, Tree } = require('postsvg');

class Image {
  /**
   * @param {string|PostSvgTree} content
   * @param {string} path
   */
  constructor(path, content) {
    const parts = path.split('?');
    this.path = parts[0];
    this.query = parts[1] ? `?${parts[1]}` : '';
    this._tree = content instanceof Tree ? content : parseSvg(content.toString());
  }

  /**
   * @return {Array<number>|undefined}
   */
  get viewBox() {
    const { width, height } = this;
    const { viewBox } = this._tree.root.attrs || {};
    let result;

    if (viewBox) {
      result = viewBox.split(' ').map(parseFloat);
    } else if (width && height) {
      result = [0, 0, width, height];
    }

    return result;
  }

  /**
   * @return {number|undefined}
   */
  get width() {
    const root = this._tree.root;
    const { width, viewBox } = root.attrs || {};
    return width || viewBox ? parseFloat(width || viewBox.split(' ')[2]) : undefined;
  }

  /**
   * @return {number|undefined}
   */
  get height() {
    const { height, viewBox } = this._tree.root.attrs || {};
    return height || viewBox ? parseFloat(height || viewBox.split(' ')[3]) : undefined; // eslint-disable-line no-magic-numbers
  }

  /**
   * @return {string}
   */
  get content() {
    return this.toString();
  }

  /**
   * @return {PostSvgTree}
   */
  get tree() {
    return this._tree.clone();
  }

  /**
   * @return {string}
   */
  toString() {
    return this._tree.toString();
  }
}

module.exports = Image;
