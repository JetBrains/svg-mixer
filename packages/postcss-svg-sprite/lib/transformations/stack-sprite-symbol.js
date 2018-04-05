const postcss = require('postcss');

const { transformSelector, objectToDeclProps } = require('../utils');

module.exports = (decl, url) => {
  const rule = decl.parent;

  const newRule = postcss
    .rule({ selector: transformSelector(rule.selector, s => `${s}::after`) })
    .append(...objectToDeclProps({
      background: `url('${url}') no-repeat`
    }));

  rule.parent.insertAfter(rule, newRule);

  decl.remove();
};
