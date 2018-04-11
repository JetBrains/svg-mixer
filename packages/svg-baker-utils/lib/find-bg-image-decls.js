const BACKGROUND_DECL_NAME_REGEXP = /^background(-image)?$/i;
const URL_FUNCTION_REGEXP = /url\([^)]*\)/ig;

/**
 * @param {postcss.Rule|postcss.Root} node
 * @return {Array<postcss.Declaration>}
 */
module.exports = node => {
  const decls = [];

  node.walkDecls(decl => {
    if (
      BACKGROUND_DECL_NAME_REGEXP.test(decl.prop) &&
      URL_FUNCTION_REGEXP.test(decl.value)
    ) {
      decls.push(decl);
    }

    BACKGROUND_DECL_NAME_REGEXP.lastIndex = 0;
    URL_FUNCTION_REGEXP.lastIndex = 0;
  });

  return decls;
};
