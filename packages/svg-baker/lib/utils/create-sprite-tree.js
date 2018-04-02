const merge = require('merge-options');
const { Tree } = require('postsvg');

const { svg: svgNs, xlink: xlinkNs } = require('../../namespaces');

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
module.exports = function createSpriteTree(config) {
  const cfg = merge(defaultConfig, config);
  return Tree.createFromArray([{
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
};
