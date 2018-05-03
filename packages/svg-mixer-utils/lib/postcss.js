const merge = require('merge-options');
const { createUrlsHelper } = require('postcss-helpers');

const BACKGROUND_DECL_NAME_REGEXP = /^background(-image)?$/i;
const URL_FUNCTION_REGEXP = /url\([^)]*\)/ig;

/**
 * @param {string} selector
 * @param {Function} transformer
 * @returns {string}
 * @example
 * transformSelector('.qwe, .qwe2', s => `${s}::after`)
 * // => '.qwe::after, .qwe2::after'
 */
module.exports.transformSelector = (selector, transformer) =>
  selector.split(',').map(s => transformer(s)).join(',');

/**
 * @param {Object} object
 * @return {Array<{prop: string, value: string}>}
 * @example
 * postcss
 *   .rule({ selector: '.qwe' })
 *   .append(...objectToDeclProps({
 *     color: 'red',
 *     'background-image': '...'
 *   }))
 */
module.exports.objectToDeclProps = object =>
  Object.keys(object).map(key => ({
    prop: key,
    value: object[key]
  }));

/**
 * @param {postcss.Rule|postcss.Root} node
 * @param {Object} [options]
 * @param {boolean} [options.createHelper=true]
 * @param {boolean} [options.skipInvalid=true]
 * @return {Array<postcss.Declaration>|Array<{decl: postcss.Declaration, helper: UrlsHelper|null}>}
 */
module.exports.findBgDecls = (node, options = {}) => {
  const opts = merge({
    createHelper: true,
    skipInvalid: true
  }, options);
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
