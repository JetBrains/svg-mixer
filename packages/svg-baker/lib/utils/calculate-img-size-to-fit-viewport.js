/* eslint-disable func-names */
/**
 * Calculate image size to fully fit in viewport. Returned value is percentage amount relative to sprite size.
 * @param {number} viewportWidth
 * @param {number} viewportHeight
 * @param {number} imgWidth
 * @param {number} imgHeight
 * @return {{width: number, height: number}}
 */
module.exports = function (viewportWidth, viewportHeight, imgWidth, imgHeight) {
  return {
    width: (viewportWidth / imgWidth) * 100,
    height: (viewportHeight / imgHeight) * 100
  };
};
