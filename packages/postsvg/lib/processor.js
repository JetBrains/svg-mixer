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
    const posthtml = this.posthtml = new PostHTML(plugins);
    this.version = posthtml.version;
    this.name = posthtml.name;
    this.plugins = posthtml.plugins;
  }

  /**
   * @param {...Function} plugins
   * @return {PostSvgProcessor}
   */
  use(...plugins) {
    this.posthtml.use(...plugins);
    return this;
  }

  /**
   * @param {string|PostSvgTree} ast
   * @param {Object} options {@see https://github.com/posthtml/posthtml-render#options}
   * @return {Promise<PostSvgResult>}
   */
  process(ast, options = {}) {
    const opts = merge({ parser }, options);
    return this.posthtml.process(ast, opts).then(({ tree }) => {
      return new Result(Tree.createFromArray(tree));
    });
  }
}

module.exports = PostSvgProcessor;
