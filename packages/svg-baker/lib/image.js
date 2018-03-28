const { parse, render } = require('postsvg');

const md5 = require('./utils/md5');

class Image {
  /**
   * @param {string|{content: string, path: string, id: string}} contentOrOpts
   */
  constructor(contentOrOpts) {
    const optsIsContent = typeof contentOrOpts === 'string';
    const content = optsIsContent ? contentOrOpts : contentOrOpts.content;

    this._tree = parse(content);
    this.id = !optsIsContent && contentOrOpts.id ? contentOrOpts.id : md5(content);
    this.path = !optsIsContent && contentOrOpts.path ? contentOrOpts.path : undefined;

    if (!this.path) {
      throw new Error('opts.path should be provided');
    }
  }

  /**
   * @return {Array<number>|undefined}
   */
  get viewBox() {
    const { attrs = {} } = this._tree;
    return attrs.viewBox ? attrs.viewBox.split(' ').map(parseFloat) : undefined;
  }

  /**
   * @return {number|undefined}
   */
  get width() {
    const { width, viewBox } = this._tree.root.attrs || {};
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
   * @return {PostSvgTree}
   */
  get tree() {
    return this._tree.clone();
  }

  get content() {
    return this.render();
  }

  render() {
    return render(this.tree);
  }

  toString() {
    return this.render();
  }
}

module.exports = Image;
