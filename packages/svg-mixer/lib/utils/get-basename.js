const path = require('path');

/**
 * @param {string} filePath
 * @return {string}
 */
module.exports = function getBasename(filePath) {
  const name = path.basename(path.resolve(filePath));
  return name.substr(0, name.lastIndexOf(path.extname(name)));
};
