const arraySum = require('./array-sum');

/**
 * Calculate top coordinate for given image in images set.
 * @param {Image} image
 * @param {Array<Image>} images
 * @param {number} [gap]
 * @return {number}
 */
module.exports = function calculateImgTopPos(image, images, gap = 0) {
  const portion = images.slice(0, images.indexOf(image));
  const heights = arraySum(portion.map(img => img.height));
  const gaps = images.length
    ? (images.length - 1) * gap
    : 0;
  return heights + gaps;
};
