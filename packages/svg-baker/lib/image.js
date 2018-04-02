const { parse } = require('postsvg');

class Image {
  /**
   * @param {string} content
   * @param {string} path
   */
  constructor(path, content) {
    this._tree = parse(content);
    this.path = path;
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

  get content() {
    return this.toString();
  }

  get tree() {
    return this._tree.clone();
  }

  toString() {
    return this._tree.toString();
  }
}

module.exports = Image;
