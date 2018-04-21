const { objectToCssDeclProps } = require('svg-mixer-utils');

module.exports = (decl, url) => {
  const rule = decl.parent;

  rule.append(...objectToCssDeclProps({
    background: `url('${url}') no-repeat`
  }));

  decl.remove();
};
