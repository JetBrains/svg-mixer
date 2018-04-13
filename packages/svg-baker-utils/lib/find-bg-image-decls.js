const { createUrlsHelper } = require('postcss-helpers');

const BACKGROUND_DECL_NAME_REGEXP = /^background(-image)?$/i;
const URL_FUNCTION_REGEXP = /url\([^)]*\)/ig;

/**
 * @param {postcss.Rule|postcss.Root} node
 * @param {boolean} [createHelper=false]
 * @return {Array<postcss.Declaration>|Array<{decl: postcss.Declaration, helper: UrlsHelper}>}
 */
module.exports = (node, createHelper = false) => {
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

  return createUrlsHelper
    ? decls.map(decl => ({ decl, helper: createHelper(decl.value) }))
    : decls;
};
