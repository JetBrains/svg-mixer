const merge = require('merge-options');
const multimatch = require('multimatch');

const BACKGROUND_DECL_NAME_REGEXP = new RegExp('^background(-image)?$', 'i');
const URL_FUNCTION_REGEXP = new RegExp('url\\\(.*?\\\)', 'ig');

function findBgImageDecl(rule) {
  let result = null;

  rule.walkDecls(decl => {
    if (
      BACKGROUND_DECL_NAME_REGEXP.test(decl.prop) &&
      URL_FUNCTION_REGEXP.test(decl.value)
    ) {
      result = decl;
    }

    BACKGROUND_DECL_NAME_REGEXP.lastIndex = 0;
    URL_FUNCTION_REGEXP.lastIndex = 0;
  });

  return result;
}

module.exports.findBgImageDecl = findBgImageDecl;

function findDeclsToMove(rule, props) {
  let decls = [];

  rule.walkDecls(decl => {
    const r = multimatch([decl.prop], props);
    if (r.length > 0) {
      decls = decls.concat(decl);
    }
  });

  return decls;
}

module.exports.findDeclsToMove = findDeclsToMove;

function transformDeclsToQuery(decls, transformer) {
  return decls.reduce((acc, decl) => {
    const { name, value } = transformer(decl);
    // eslint-disable-next-line no-param-reassign
    acc = merge(acc, { [name]: encodeURIComponent(value) });
    return acc;
  }, {});
}

module.exports.transformDeclsToQuery = transformDeclsToQuery;
