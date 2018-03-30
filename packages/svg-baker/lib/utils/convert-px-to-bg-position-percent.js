/**
 * @param {number} px In pixels
 * @param {number} imgWidth In pixels
 * @param {number} containerWidth In pixels
 * @see https://www.w3.org/TR/css-backgrounds-3/#the-background-position
 * @see https://css-tricks.com/i-like-how-percentage-background-position-works/
 * @see http://blog.vjeux.com/2012/image/css-understanding-percentage-background-position.html
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-position
 * @see https://stackoverflow.com/a/43533027/4624403
 */
module.exports = function convertPxToBgPositionPercent(px, imgWidth, containerWidth) {
  return px / (containerWidth - imgWidth) * 100;
};
