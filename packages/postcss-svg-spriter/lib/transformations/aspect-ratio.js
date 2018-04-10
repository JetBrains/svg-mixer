const postcss = require('postcss');

const { transformSelector, objectToDeclProps } = require('../utils');

function generateProps(percentage) {
  return objectToDeclProps({
    display: 'block',
    'box-sizing': 'content-box',
    'padding-bottom': percentage,
    content: '\'\''
  });
}

/**
 * @param {postcss.Rule} rule
 * @param {string} percentage e.g. '57%'
 * @param {boolean} createNewRule=false
 */
module.exports = (rule, percentage, createNewRule = true) => {
  if (createNewRule) {
    const newRule = postcss
      .rule({ selector: transformSelector(rule.selector, s => `${s}::before`) })
      .append(...generateProps(percentage));

    rule.after(newRule);
  } else {
    rule.append(...generateProps(percentage));
  }
};
