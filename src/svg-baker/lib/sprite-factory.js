const processor = require('../../posthtml-svg-mode/lib/processor');
const merge = require('merge-options');
const match = require('posthtml/lib/api').match;
const { svg, xlink } = require('./namespaces');

const defaultConfig = {
  attrs: {
    [svg.name]: svg.value,
    [xlink.name]: xlink.name
  },
  css: 'use {display: none;} use:target {display: inline;}',
  symbols: []
};

/**
 * @param {PostHTMLTree} tree
 * @return {Object|null}
 */
function collectNamespaces(tree) {
  const namespaces = {};

  match.call(tree, { tag: /.*/ }, (node) => {
    const attrs = node.attrs || {};

    Object.keys(attrs).forEach((attr) => {
      if (attr.startsWith('xmlns')) {
        namespaces[attr] = attrs[attr];
      }
    });

    return node;
  });

  return Object.keys(namespaces).length > 0 ? namespaces : null;
}

/**
 * TODO simplify
 * @param {Object} [config] {@see defaultConfig}
 * @return {Function} PostHTML plugin
 */
function plugin(config = {}) {
  const cfg = merge(defaultConfig, config);
  const styles = cfg.css;
  const symbols = cfg.symbols;
  const trees = symbols.map(s => s.tree);
  const namespaces = collectNamespaces(trees);
  const attrs = Object.assign({}, cfg.attrs, namespaces);

  const usages = symbols.map((symbol) => {
    const { id, usageId } = symbol;
    return {
      tag: 'use',
      attrs: { id: usageId, 'xlink:href': `#${id}` }
    };
  });

  return (tree) => {
    const sprite = {
      tag: 'svg',
      attrs,
      content: [{
        tag: 'defs',
        content: [{
          tag: 'style',
          content: styles
        }].concat(trees)
      }].concat(usages)
    };

    tree[0] = sprite;

    return tree;
  };
}

/**
 * @param {Object} options {@see defaultConfig}
 * @return {Promise<PostHTMLProcessingResult>}
 */
function spriteFactory(options) {
  return processor([plugin(options)]).process('');
}

module.exports = spriteFactory;
module.exports.plugin = plugin;
module.exports.collectNamespaces = collectNamespaces;
