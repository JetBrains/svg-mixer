const getImageSize = require('image-size');
const { svg } = require('../namespaces');

/**
 * @param {Buffer} buffer
 * @return {string}
 */
function rasterToSVG(buffer) {
  const info = getImageSize(buffer);
  const { width, height, type } = info;
  const defaultNS = `${svg.name}="${svg.value}"`;
  const data = `data:image/${type};base64,${buffer.toString('base64')}`;

  return [
    `<svg ${defaultNS} width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<image xlink:href="${data}" width="${width}" height="${height}" />`,
    '</svg>'
  ].join('');
}

module.exports = rasterToSVG;
