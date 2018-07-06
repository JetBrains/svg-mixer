const anymatch = require('anymatch');

/**
 * @param {RegExp|string|Array<RegExp|string>} patterns
 * @return {function(string): boolean}
 */
module.exports.createMatcher = patterns => path => anymatch(patterns, path);
module.exports.postcss = require('./lib/postcss');
module.exports.ResolveError = require('./lib/resolve-error');
module.exports.resolveFile = require('./lib/resolve-file');
module.exports.validate = require('./lib/validate');
