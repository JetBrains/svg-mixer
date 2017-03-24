const processor = require('../../posthtml-svg-mode/lib/processor');

const fill = require('../../posthtml-svg-fill/lib/posthtml-svg-fill');
const renameId = require('../../posthtml-rename-id/lib/posthtml-rename-id');
const normalizeViewBox = require('./transformations/normalize-viewbox');
const rasterToSVG = require('./transformations/raster-to-svg');
const svgToSymbol = require('./transformations/svg-to-symbol');

/**
 * @param {Object} config
 * @param {string} config.id
 * @param {string} config.content
 * @param {FileRequest} config.request
 * @return {Promise<PostHTMLProcessingResult>}
 */
function symbolFactory(config) {
  const { id, request } = config;
  const { query } = request;
  const fillParam = (query && query.fill) ? query.fill : null;

  const content = Buffer.isBuffer(config.content)
    ? rasterToSVG(config.content)
    : config.content;

  const plugins = [
    normalizeViewBox(),
    fill({ fill: fillParam }),
    renameId({ pattern: `${id}_[id]` }),
    svgToSymbol({ id })
  ];

  return processor(plugins).process(content);
}

module.exports = symbolFactory;
