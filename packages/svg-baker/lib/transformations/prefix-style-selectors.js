const decodeEntities = require('he').decode;
const postcss = require('postcss');
const prefixSelectors = require('postcss-prefix-selector');

module.exports = function prefixStyleSelectors(prefix) {
  return tree => {
    const styleNodes = [];

    tree.match({ tag: 'style' }, node => {
      styleNodes.push(node);
      return node;
    });

    const promises = styleNodes.map(node => {
      const content = node.content ? decodeEntities(node.content.join('')) : '';

      return postcss()
        .use(prefixSelectors({ prefix }))
        .process(content, { from: undefined }) // prevent postcss warning
        .then(({ css }) => node.content = css);
    });

    return Promise.all(promises).then(() => tree);
  };
};
