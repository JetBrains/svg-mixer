module.exports = function extractNamespacesToRoot() {
  return tree => {
    const namespaces = {};

    tree.match({ tag: /.*/ }, node => {
      const attrs = node.attrs || {};

      Object.keys(attrs).forEach(attr => {
        if (attr.startsWith('xmlns')) {
          if (attr in namespaces === false) {
            namespaces[attr] = attrs[attr];
          }

          delete node.attrs[attr];
        }
      });

      return node;
    });

    const root = tree.root;
    root.attrs = root.attrs || {};

    Object.keys(namespaces).forEach(name => root.attrs[name] = namespaces[name]);

    return tree;
  };
};
