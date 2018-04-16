const isPlainObject = require('is-plain-object');
const { match } = require('posthtml/lib/api');
const matchHelper = require('posthtml-match-helper');

const { name: packageName } = require('./package.json');

module.exports = opts => {
  let transformers;

  if (isPlainObject(opts) || typeof opts === 'function') {
    transformers = [opts];
  } else if (Array.isArray(opts)) {
    transformers = opts;
  } else {
    throw new Error(`${packageName}: options should be Object|Array<Object|Function>|Function`);
  }

  return tree => {
    transformers.forEach(transformer => {
      const isFunc = typeof transformer === 'function';
      const matcher = isFunc || !transformer.selector
        ? { tag: /.*/ }
        : matchHelper(transformer.selector);

      const nodes = [];
      match.call(tree, matcher, node => {
        nodes.push(node);
        return node;
      });

      nodes.forEach(node => {
        if (isFunc) {
          transformer(node);
        } else {
          const { attr, value, tag } = transformer;

          if (tag) {
            node.tag = tag;
          }

          if (attr && value) {
            node.attrs = node.attrs || {};
            node.attrs[transformer.attr] = transformer.value;
          }
        }
      });
    });

    return tree;
  };
};
