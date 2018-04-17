/* eslint-disable func-names */
const postcss = require('postcss');

const encode = require('./postcss-encode-query-string-params');

module.exports = function (content, sourcemap) {
  if (this.version === 1 && this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();

  postcss()
    .use(encode())
    .process(content)
    .then(({ css }) => callback(null, css, sourcemap))
    .catch(callback);
};
