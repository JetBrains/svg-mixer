const clone = require('clone');

const renderer = require('./renderer');

class Tree extends Array {
  /**
   * @param {Array} array
   * @return {Tree}
   */
  static createFromArray(array) {
    let wrapper = new Tree();
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
    return Tree.createFromArray(cloned);
  }
}

module.exports = Tree;
