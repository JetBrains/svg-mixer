const merge = require('merge-options');

/**
 * @param {Image} img
 * @param {Object} [extraAttrs]
 * @return {{tag: string, attrs: Object}}
 */
module.exports = function createSymbolUsage(img, extraAttrs = {}) {
  const { id, width, height } = img;

  const attrs = merge({
    'xlink:href': `#${id}`,
    width,
    height
  }, extraAttrs);

  return {
    tag: 'use',
    attrs
  };
};
