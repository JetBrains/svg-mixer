const merge = require('merge-options');
const postsvg = require('postsvg');

const { svg: svgNs, xlink: xlinkNs } = require('../../namespaces');
const { moveNamespacesToRoot, moveNodesOutsideSymbol } = require('../transformations');

const defaultConfig = {
  attrs: {
    [svgNs.name]: svgNs.uri,
    [xlinkNs.name]: xlinkNs.uri
  },
  defs: null,
  content: null
};

/**
 * @param {Object} [config] {@see defaultConfig}
 * @return {Promise<PostSvgTree>}
 */
module.exports = function generateSpriteTree(config = {}) {
  const cfg = merge(defaultConfig, config);

  const tree = postsvg.Tree.createFromArray([{
    tag: 'svg',
    attrs: cfg.attrs,
    content: [
      {
        tag: 'defs',
        content: cfg.defs || []
      },
      cfg.content || false
    ].filter(Boolean)
  }]);

  return postsvg([
    moveNamespacesToRoot(),
    moveNodesOutsideSymbol()
  ])
    .process(tree, { skipParse: true })
    .then(res => res.tree);
};
