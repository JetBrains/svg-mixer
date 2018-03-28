const merge = require('deepmerge');
const PostHTML = require('posthtml');

const parser = require('./parser');
const Result = require('./result');
const Tree = require('./tree');

class PostSvgProcessor {
  /**
   * @param {Array<Function>} [plugins]
   */
  constructor(plugins) {
    const posthtml = this.posthtml = PostHTML(plugins);
    this.version = posthtml.version;
    this.name = posthtml.name;
    this.plugins = posthtml.plugins;
  }

  /**
   * @param {...Function} plugins
   * @return {PostSvgProcessor}
   */
  use(...plugins) {
    this.posthtml.use.apply(this, ...plugins);
    return this;
  }

  /**
   * @param {string|Tree} ast
   * @param {Object} options {@see https://github.com/posthtml/posthtml-render#options}
   * @return {Promise<Result>}
   */
  process(ast, options = {}) {
    const opts = merge({ parser }, options);
    return this.posthtml.process(ast, opts).then((res) => {
      const tree = new Tree(res.tree);
      return new Result(tree);
    });
  }
}

module.exports = PostSvgProcessor;
