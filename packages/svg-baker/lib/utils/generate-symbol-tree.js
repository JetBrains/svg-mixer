const postsvg = require('postsvg');
const renameId = require('posthtml-rename-id');

const {
  svgToSymbol,
  normalizeViewBox,
  prefixStyleSelectors
} = require('../transformations');

/**
 * @param {SpriteSymbol} symbol
 * @return {Promise<PostSvgTree>}
 */
module.exports = function generateSymbolTree(symbol) {
  const { id } = symbol;

  return postsvg([
    normalizeViewBox(),
    prefixStyleSelectors(`#${id}`),
    renameId(`${id}_[id]`),
    svgToSymbol({ id })
  ])
    .process(symbol.image.tree, { skipParse: true })
    .then(res => res.tree);
};
