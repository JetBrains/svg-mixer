const path = require('path');
const { promisify } = require('util');
const stat = promisify(require('fs').stat);

/**
 * @param {string} filepath
 * @param {string} [context] Context directory
 * @param {boolean} failIfError
 * @returns {Promise<string>}
 */
module.exports = function resolveFile(filepath, context = process.cwd()) {
  let resolvedPath;
  const resolveAsNodeModule = filepath.startsWith('~');

  if (resolveAsNodeModule) {
    try {
      resolvedPath = require.resolve(filepath.substr(1));
    } catch (e) {
      return Promise.reject(new Error(`Not found ${filepath}`));
    }
  } else {
    resolvedPath = path.resolve(context, filepath);
  }

  return stat(resolvedPath).then(info => {
    return info.isFile()
      ? resolvedPath
      : Promise.reject(new Error(`Not a file ${resolvedPath}`));
  }).catch(() => Promise.reject(new Error(`Not found ${resolvedPath}`)));
};
