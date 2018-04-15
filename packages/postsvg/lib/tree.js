const clone = require('clone');
const { match } = require('posthtml/lib/api');
const matchHelper = require('posthtml-match-helper');

const renderer = require('./renderer');

/**
 * @typedef {Object} Node
 */

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

  /**
   * @return {Node}
   */
  get root() {
    return this.find(node => typeof node === 'object' && 'tag' in node);
  }

  /**
   * @return {string}
   */
  toString() {
    return renderer(this, this.options);
  }

  /**
   * @return {PostSvgTree}
   */
  clone() {
    return PostSvgTree.createFromArray(clone(this));
  }

  /**
   * @param {string} selector
   * @return {Node[]}
   */
  select(selector) {
    const nodes = [];

    match.call(this, matchHelper(selector), node => {
      nodes.push(node);
      return node;
    });

    return nodes;
  }

  /**
   * @param {string} selector
   * @param {function(node): void} callback
   * @return {void}
   */
  each(selector, callback) {
    return this.select(selector).forEach(callback);
  }
}

module.exports = PostSvgTree;
