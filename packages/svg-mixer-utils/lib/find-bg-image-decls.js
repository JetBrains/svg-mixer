const merge = require('merge-options');
const { createUrlsHelper } = require('postcss-helpers');

const BACKGROUND_DECL_NAME_REGEXP = /^background(-image)?$/i;
const URL_FUNCTION_REGEXP = /url\([^)]*\)/ig;

const defaultOpts = {
  createHelper: true,
  skipInvalid: true
};

/**
 * @param {postcss.Rule|postcss.Root} node
 * @param {Object} [options] {@see defaultOpts}
 * @return {Array<postcss.Declaration>|Array<{decl: postcss.Declaration, helper: UrlsHelper|null}>}
 */
module.exports = (node, options = {}) => {
  const opts = merge(defaultOpts, options);
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

  let result = decls;

  if (opts.createHelper) {
    result = decls.map(decl => {
      // URL/URLs could be invalid, in this case set helper=null
      const helper = createUrlsHelper(decl.value);
      return {
        decl,
        helper: helper || null,
        valid: !!helper
      };
    });

    if (opts.skipInvalid) {
      result = result.filter(({ valid }) => valid);
    }
  }

  return result;
};
