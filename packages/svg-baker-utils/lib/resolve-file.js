const path = require('path');
const { promisify } = require('util');
const stat = promisify(require('fs').lstat);

const ResolveError = require('./resolve-error');

/**
 * @param {string} request
 * @param {string} [context] Context directory
 * @returns {Promise<string|ResolveError>}
 */
module.exports = (request, context = process.cwd()) => {
  let resolvedPath;
  const filepath = request.split('?')[0]; // strip query
  const resolveAsNodeModule = filepath.startsWith('~');
  const CODES = ResolveError.CODES;

  if (resolveAsNodeModule) {
    try {
      resolvedPath = require.resolve(filepath.substr(1));
      return Promise.resolve(resolvedPath);
    } catch (e) {
      return Promise.reject(new ResolveError(filepath, CODES.NOT_FOUND));
    }
  } else {
    resolvedPath = path.resolve(context, filepath);

    return stat(resolvedPath)
      .then(info => (info.isFile()
        ? resolvedPath
        : Promise.reject(new ResolveError(resolvedPath, CODES.NOT_A_FILE))))
      .catch(error => {
        throw error.code && error.code === 'ENOENT'
          ? new ResolveError(resolvedPath, CODES.NOT_FOUND)
          : error;
      });
  }
};
