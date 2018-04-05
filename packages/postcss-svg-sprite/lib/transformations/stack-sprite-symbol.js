const { objectToDeclProps } = require('../utils');

module.exports = (decl, url) => {
  const rule = decl.parent;

  rule.append(...objectToDeclProps({
    background: `url('${url}') no-repeat`,
    content: '""'
  }));

  decl.remove();
};
