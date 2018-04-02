const merge = require('merge-options');
const { Tree } = require('postsvg');

const { svg: svgNs, xlink: xlinkNs } = require('../../namespaces');

const defaultConfig = {
  attrs: {
    [svgNs.name]: svgNs.uri,
    [xlinkNs.name]: xlinkNs.uri
  },
  symbols: null,
  usages: null
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
        content: cfg.symbols || []
      },
      cfg.usages || false
    ].filter(Boolean)
  }]);
};
