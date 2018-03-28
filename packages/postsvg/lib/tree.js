const clone = require('clone');

const renderer = require('./renderer');

class PostSvgTree extends Array {
  /**
   * @param {Array} array
   * @return {PostSvgTree}
   */
  static createFromArray(array) {
    let wrapper = new PostSvgTree();
    wrapper = wrapper.concat(array);
    return wrapper;
  }

  get root() {
    return this.find(node => typeof node === 'object' && 'tag' in node);
  }

  toString() {
    return renderer(this, this.options);
  }

  clone() {
    const cloned = clone(this);
    return PostSvgTree.createFromArray(cloned);
  }
}

module.exports = PostSvgTree;
