class PostSvgResult {
  /**
   * @param {PostSvgTree} tree
   */
  constructor(tree) {
    this.tree = tree;
  }

  get html() {
    return this.toString();
  }

  get svg() {
    return this.toString();
  }

  toString() {
    return this.tree.toString();
  }
}

module.exports = PostSvgResult;
