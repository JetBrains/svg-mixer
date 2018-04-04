const SpriteSymbol = require('../symbol');

const createImageFromFile = require('./create-image-from-file');

/**
 * @param {string} id
 * @param {string} path
 * @return {Promise<SpriteSymbol>}
 */
module.exports = function createSymbolFromFile(id, path) {
  return createImageFromFile(path).then(img => new SpriteSymbol(id, img));
};
