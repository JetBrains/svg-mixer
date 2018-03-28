const renderer = require('./renderer');

class Tree extends Array {
  get root() {
    return this.find(node => typeof node === 'object' && 'tag' in node);
  }

  toString() {
    return renderer(this, this.options);
  }
}

module.exports = Tree;
