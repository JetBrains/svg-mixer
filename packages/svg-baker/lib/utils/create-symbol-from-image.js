const postsvg = require('postsvg');
const renameId = require('posthtml-rename-id');

const {
  svgToSymbol,
  normalizeViewBox,
  prefixStyleSelectors
} = require('../transformations');

/**
 * @param {Image} img
 * @param {Array<Function>} [plugins]
 * @return {Promise<PostSvgTree>}
 */
module.exports = function createImageFromSymbol(img, plugins) {
  const { id, tree } = img;

  const plugs = plugins || [
    normalizeViewBox(),
    prefixStyleSelectors(`#${id}`),
    renameId(`${id}_[id]`),
    svgToSymbol({ id })
  ];

  return postsvg(plugs)
    .process(tree, { skipParse: true })
    .then(res => res.tree);
};
