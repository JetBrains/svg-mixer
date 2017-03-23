const PostHTML = require('posthtml');
const parser = require('./parser');
const renderer = require('./renderer');

/**
 * @typedef {Object} PostHTMLTree
 * @see https://github.com/posthtml/posthtml/blob/master/docs/tree.md#json
 */

class ProcessingResult {
  constructor(tree) {
    this.tree = tree;
  }

  toString() {
    return renderer(this.tree, this.tree.options);
  }

  get html() {
    return this.toString();
  }
}

class Processor {
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
   * @return {Processor}
   */
  use(...plugins) {
    this.posthtml.use.apply(this, ...plugins);
    return this;
  }

  /**
   * @param {PostHTMLTree} ast
   * @param {Object} options {@see https://github.com/posthtml/posthtml-render#options}
   * @return {Promise<ProcessingResult>}
   */
  process(ast, options = null) {
    const opts = Object.assign({ parser }, options);
    return this.posthtml.process(ast, opts).then(({ tree }) => new ProcessingResult(tree));
  }
}

Processor.parser = parser;
Processor.render = renderer;

/**
 * @param {Array<Function>} [plugins]
 * @return {Processor}
 */
module.exports = plugins => new Processor(plugins);
module.exports.parser = parser;
module.exports.renderer = renderer;
module.exports.Processor = ProcessingResult;
module.exports.Result = ProcessingResult;
