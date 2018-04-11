const anymatch = require('anymatch');

module.exports.createMatcher = patterns => path => anymatch(patterns, path);
module.exports.findBgImageDecls = require('./lib/find-bg-image-decls');
module.exports.ResolveError = require('./lib/resolve-error');
module.exports.resolveFile = require('./lib/resolve-file');

