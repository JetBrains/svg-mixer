const clone = require('clone');
const { match, walk } = require('posthtml/lib/api');
const matchHelper = require('posthtml-match-helper');

const renderer = require('./renderer');

/**
 * @typedef {Object} Node
 * @property {string} tag
 * @property {Object} [attrs]
 * @property {Array<Node|string>} [content]
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

  match(expression, callback) {
    return match.call(this, expression, callback);
  }

  walk(callback) {
    return walk.call(this, callback);
  }

  /**
   * @param {string} selector
   * @return {Node[]}
   */
  select(selector) {
    const nodes = [];
    const selectAllNodes = typeof selector === 'undefined' || selector === '*';
    const matcher = selectAllNodes ? { tag: /\.*/ } : matchHelper(selector);

    match.call(this, matcher, node => {
      nodes.push(node);
      return node;
    });

    return nodes;
  }

  /**
   * @param {string|function(node): void} selector
   * @param {function(node): void} [callback]
   * @return {Node[]}
   */
  each(selector, callback) {
    const hasSelector = typeof selector === 'string';
    const nodes = this.select(hasSelector ? selector : '*');
    return selector
      ? nodes.forEach(typeof selector === 'function' ? selector : callback)
      : nodes;
  }
}

module.exports = PostSvgTree;
