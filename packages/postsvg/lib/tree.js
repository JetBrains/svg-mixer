const renderer = require('./renderer');

class Tree {
  /**
   * @param {Object} tree PostHTML tree
   * @see https://github.com/posthtml/posthtml/blob/master/docs/tree.md#json
   */
  constructor(tree) {
    this.tree = tree;
  }

  toString() {
    return renderer(this.tree, this.tree.options);
  }
}

module.exports = Tree;