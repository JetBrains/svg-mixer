/**
 * Calculate image size to fully fit in viewport. Returned value is percentage amount relative to sprite size.
 * @param {{width: number, height: number}} viewportSize
 * @param {{width: number, height: number}} imgSize
 * @return {{width: number, height: number}}
 */
module.exports = function calculateImgSizeToFitViewport(viewportSize, imgSize) {
  const widthRatio = viewportSize.width / imgSize.width;
  const heightRatio = viewportSize.height / imgSize.height;
  const width = widthRatio * 100;
  const height = heightRatio * 100;
  return { width, height };
};
