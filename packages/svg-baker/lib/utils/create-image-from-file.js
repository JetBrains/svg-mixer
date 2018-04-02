const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);

const Image = require('../image');

/**
 * @param {string} filepath
 * @return {Promise<Image>}
 */
module.exports = function createImageFromFile(filepath) {
  return readFile(filepath).then(content => new Image(filepath, content));
};
