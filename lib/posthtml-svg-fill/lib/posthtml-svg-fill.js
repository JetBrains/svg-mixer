/* eslint-disable no-param-reassign */
const merge = require('merge-options');

const defaultOptions = {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element#Graphics_elements
   */
  selector: [
    'circle',
    'ellipse',
    'line',
    'path',
    'polygon',
    'polyline',
    'rect',
    'text',
    'use'
  ].join(',')
};

/**
 * @param {string} selector
 * @returns {Array<Object>} matcher for posthtml#match
 */
function selectorToMatcher(selector) {
  return selector
    .split(',')
    .map(item => item.trim())
    .map((item) => {
      const matcher = {};
      const firstSymbol = item.substr(0, 1);

      switch (firstSymbol) {
        case '#':
          matcher.attrs = matcher.attrs || {};
          matcher.attrs.id = item.substr(1);
          break;

        case '.':
          matcher.attrs = matcher.attrs || {};
          matcher.attrs.class = item.substr(1);
          break;

        default:
          matcher.tag = item;
          break;
      }

      return matcher;
    });
}

function plugin(options = {}) {
  const opts = merge(defaultOptions, options);
  const fill = opts.fill || null;
  const matcher = selectorToMatcher(opts.selector);

  return (tree) => {
    tree.match(matcher, (node) => {
      if (fill) {
        node.attrs = node.attrs || {};
        node.attrs.fill = fill;
      }
      return node;
    });
  };
}

module.exports = plugin;
module.exports.defaultOptions = defaultOptions;
module.exports.selectorToMatcher = selectorToMatcher;
