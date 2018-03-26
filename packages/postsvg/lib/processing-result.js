class ProcessingResult {
  /**
   * @param {Tree} tree
   */
  constructor(tree) {
    this.tree = tree;
  }

  get html() {
    return this.toString();
  }

  toString() {
    return this.tree.toString();
  }
}

module.exports = ProcessingResult;