const { objectToCssDeclProps } = require('svg-baker-utils');

module.exports = (decl, url) => {
  const rule = decl.parent;

  rule.append(...objectToCssDeclProps({
    background: `url('${url}') no-repeat`
  }));

  decl.remove();
};
