const merge = require('merge-options');
const processor = require('posthtml-svg-mode');
const extractNamespacesToRoot = require('./transformations/extract-namespaces-to-root');
const moveFromSymbolToRoot = require('./transformations/move-from-symbol-to-root');
const { svg, xlink } = require('../namespaces');

const defaultConfig = {
  attrs: {
    [svg.name]: svg.value,
    [xlink.name]: xlink.uri
  },
  css: 'use {display: none;} use:target {display: inline;}',
  symbols: []
};

/**
 * TODO simplify
 * @param {Object} [config] {@see defaultConfig}
 * @return {Function} PostHTML plugin
 */
function spritePlugin(config = {}) {
  const cfg = merge(defaultConfig, config);
  const symbols = cfg.symbols;
  const trees = symbols.map(s => s.tree);

  const usages = symbols.map((symbol) => {
    const { id, useId } = symbol;
    return {
      tag: 'use',
      attrs: { id: useId, 'xlink:href': `#${id}` }
    };
  });

  return (tree) => {
    tree[0] = {
      tag: 'svg',
      attrs: cfg.attrs,
      content: [{
        tag: 'defs',
        content: [{
          tag: 'style',
          content: cfg.css
        }].concat(trees)
      }].concat(usages)
    };

    return tree;
  };
}

/**
 * @param {Object} options {@see defaultConfig}
 * @return {Promise<PostHTMLProcessingResult>}
 */
function spriteFactory(options) {
  const plugins = [
    spritePlugin(options),
    extractNamespacesToRoot(),
    moveFromSymbolToRoot()
  ];
  return processor(plugins).process('');
}

module.exports = spriteFactory;
module.exports.spritePlugin = spritePlugin;
