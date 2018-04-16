const micromatch = require('micromatch');
const merge = require('merge-options');

const defaultConfig = {
  preserve: [
    'id',
    'viewBox',
    'preserveAspectRatio',
    'class',
    'overflow',
    'stroke?(-*)',
    'fill?(-*)',
    'xmlns?(:*)'
  ]
};

/**
 * @param {Object} [config] {@see defaultConfig}
 * @return {Function} PostHTML plugin
 */
module.exports = function svgToSymbol(config) {
  const cfg = merge(defaultConfig, config);

  return tree => {
    const root = tree.root;
    root.tag = 'symbol';
    root.attrs = root.attrs || {};

    const attrNames = Object.keys(root.attrs);
    const attrNamesToPreserve = micromatch(attrNames, cfg.preserve, { nocase: true });

    attrNames.forEach(name => {
      if (!attrNamesToPreserve.includes(name)) {
        delete root.attrs[name];
      }
    });

    if (cfg.id) {
      root.attrs.id = cfg.id;
    }

    // Remove all elements and add symbol node
    tree.splice(0, tree.length, root);

    return tree;
  };
};
