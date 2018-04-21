const anymatch = require('anymatch');

/**
 * @param {RegExp|string|Array<RegExp|string>} patterns
 * @return {function(string): boolean}
 */
module.exports.createMatcher = patterns => path => anymatch(patterns, path);

/**
 * @param {string} selector
 * @param {Function} transformer
 * @returns {string}
 */
module.exports.transformCssSelector = (selector, transformer) =>
  selector.split(',').map(s => transformer(s)).join(',');

/**
 * @param {Object} object
 * @return {Array<{prop: string, value: string}>}
 */
module.exports.objectToCssDeclProps = object =>
  Object.keys(object).map(key => ({
    prop: key,
    value: object[key]
  }));

module.exports.findCssBgImageDecls = require('./lib/find-bg-image-decls');
module.exports.ResolveError = require('./lib/resolve-error');
module.exports.resolveFile = require('./lib/resolve-file');
