const processor = require('posthtml-svg-mode');
const fill = require('posthtml-svg-fill');
const renameId = require('posthtml-rename-id');
const normalizeViewBox = require('./transformations/normalize-viewbox');
const rasterToSVG = require('./transformations/raster-to-svg');
const svgToSymbol = require('./transformations/svg-to-symbol');

/**
 * @param {Object} options
 * @param {string} [options.id]
 * @param {string} options.content
 * @param {FileRequest} options.request
 * @return {Promise<PostHTMLProcessingResult>}
 */
function symbolFactory(options) {
  const { id, request } = options;
  const plugins = [];

  // convert raster image to svg
  const content = Buffer.isBuffer(options.content)
    ? rasterToSVG(options.content)
    : options.content;

  plugins.push(normalizeViewBox());

  // fill plugin
  if (request.hasParam('fill')) {
    plugins.push(fill({ fill: request.getParam('fill') }));
  }

  plugins.push(renameId({ pattern: `${id}_[id]` }));
  plugins.push(svgToSymbol({ id }));

  return processor(plugins).process(content);
}

module.exports = symbolFactory;
