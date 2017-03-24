const merge = require('merge-options');
const { getRoot } = require('../utils');

const defaultConfig = {
  id: null,
  preserve: ['viewBox', 'preserveAspectRatio', 'class']
};

/**
 * @param {Object} [config] {@see defaultConfig}
 * @return {Function} PostHTML plugin
 */
function svgToSymbol(config = {}) {
  const cfg = merge(defaultConfig, config);

  return (tree) => {
    const root = getRoot(tree);
    root.tag = 'symbol';
    root.attrs = root.attrs || {};

    Object.keys(root.attrs).forEach((attr) => {
      if (!cfg.preserve.includes(attr)) {
        delete root.attrs[attr];
      }
    });

    root.attrs.id = cfg.id;

    return tree;
  };
}

module.exports = svgToSymbol;
