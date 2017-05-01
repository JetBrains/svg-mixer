const postcss = require('postcss');
const prefixSelectors = require('postcss-prefix-selector');

/**
 * @return {Function} PostHTML plugin
 */
function prefixStyleSelectors(prefix) {
  return (tree) => {
    tree.match({ tag: 'style' }, (node) => {
      const styles = node.content;
      node.content = postcss().use(prefixSelectors({ prefix })).process(styles).css;

      return node;
    });

    return tree;
  };
}

module.exports = prefixStyleSelectors;

