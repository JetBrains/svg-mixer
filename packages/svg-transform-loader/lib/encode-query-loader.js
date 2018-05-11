/* eslint-disable func-names */
const postcss = require('postcss');

const encode = require('./postcss-encode-query-string-params');

module.exports = function (content, sourcemap, meta = {}) {
  if (this.version === 1 && this.cacheable) {
    this.cacheable();
  }

  // eslint-disable-next-line consistent-this
  const loader = this;
  const callback = loader.async();
  const from = this.resourcePath + this.resourceQuery;

  // Reuse AST from postcss if available
  const ast = meta && meta.ast && meta.ast.type === 'postcss'
    ? meta.ast.root
    : postcss.parse(content, { from });

  postcss()
    .use(encode())
    .process(ast, { from })
    .then(({ css }) => callback(null, css, sourcemap, meta))
    .catch(callback);
};
