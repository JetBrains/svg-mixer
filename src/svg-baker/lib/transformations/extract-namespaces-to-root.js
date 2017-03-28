const match = require('posthtml/lib/api').match;
const { getRoot } = require('../utils');


/**
 * @return {Function} PostHTML plugin
 */
function extractNamespacesToRoot() {
  return (tree) => {
    const namespaces = {};

    match.call(tree, { tag: /.*/ }, (node) => {
      const attrs = node.attrs || {};

      Object.keys(attrs).forEach((attr) => {
        if (attr.startsWith('xmlns')) {
          if (attr in namespaces === false) {
            namespaces[attr] = attrs[attr];
          }

          delete node.attrs[attr];
        }
      });

      return node;
    });

    const root = getRoot(tree);
    root.attrs = root.attrs || {};

    Object.keys(namespaces).forEach(name => root.attrs[name] = namespaces[name]);

    return tree;
  };
}

module.exports = extractNamespacesToRoot;
