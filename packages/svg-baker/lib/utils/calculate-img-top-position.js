/**
 * Calculate top coordinate for given image in images set.
 * @param {Image} image
 * @param {Array<Image>} images
 * @param {number} [gap]
 * @return {number}
 */
module.exports = function calculateImgTopPos(image, images, gap = 0) {
  const portion = images.slice(0, images.indexOf(image));
  const heights = portion.map(img => img.height).reduce((sum, height) => sum + height, 0);
  const gaps = portion.length * gap;
  return heights + gaps;
};
