const postcss = require('postcss');

const { transformSelector, objectToDeclProps } = require('../utils');

/**
 * @param {postcss.Rule} rule
 * @param {string} aspectRatio
 */
module.exports = (rule, aspectRatio) => {
  const newRule = postcss
    .rule({ selector: transformSelector(rule.selector, s => `${s}::before`) })
    .append(...objectToDeclProps({
      display: 'block',
      'box-sizing': 'content-box',
      'padding-bottom': aspectRatio,
      content: '""'
    }));

  rule.parent.insertAfter(rule, newRule);
};
