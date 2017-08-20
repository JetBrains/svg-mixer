const { getRoot } = require('../utils');

const defaultConfig = {
  id: undefined,
  preserve: [
    'viewBox',
    'preserveAspectRatio',
    'class',
    'overflow',
    'stroke',
    'fill'
  ]
};

/**
 * @param {Object} [config] {@see defaultConfig}
 * @return {Function} PostHTML plugin
 */
function svgToSymbol(config = null) {
  const cfg = Object.assign({}, defaultConfig, config);

  return (tree) => {
    const root = getRoot(tree);
    root.tag = 'symbol';
    root.attrs = root.attrs || {};

    Object.keys(root.attrs).forEach((attr) => {
      if (!cfg.preserve.includes(attr)) {
        delete root.attrs[attr];
      }
    });

    if (cfg.id) {
      root.attrs.id = cfg.id;
    }

    // Remove all elements and add symbol node
    tree.splice(0, tree.length, root);

    return tree;
  };
}

module.exports = svgToSymbol;
