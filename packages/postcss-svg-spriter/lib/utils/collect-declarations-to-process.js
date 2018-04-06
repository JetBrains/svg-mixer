const path = require('path');

const Promise = require('bluebird');
const merge = require('merge-options');
const { createUrlsHelper } = require('postcss-helpers');

const resolveFile = require('./resolve-file');

const BACKGROUND_DECL_NAME_REGEXP = new RegExp('^background(-image)?$', 'i');
const URL_FUNCTION_REGEXP = new RegExp('url\\\(.*?\\\)', 'ig');

function isDeclarationShouldBeProcessed(decl) {
  const shouldBeProcessed =
    BACKGROUND_DECL_NAME_REGEXP.test(decl.prop) &&
    URL_FUNCTION_REGEXP.test(decl.value);

  BACKGROUND_DECL_NAME_REGEXP.lastIndex = 0;
  URL_FUNCTION_REGEXP.lastIndex = 0;

  return shouldBeProcessed;
}

const defaultOptions = {
  resolveUrls: true
};

/**
 * @param {postcss.Root} root
 * @param {Object} [opts] {@see defaultOptions}
 * @return {Promise<Array<{path: string, decl: postcss.Declaration}>>}
 */
module.exports = function collectDeclarationsToProcess(root, opts) {
  const { resolveUrls } = merge(defaultOptions, opts);
  const from = root.source.input.file;
  const stylesheetContextPath = from ? path.dirname(from) : undefined;
  const entries = [];

  root.walkDecls(decl => {
    if (isDeclarationShouldBeProcessed(decl)) {
      const url = createUrlsHelper(decl.value).URIS[0].toString();
      entries.push({ url, decl });
    }
  });

  return Promise.map(entries, ({ url, decl }) => Promise.props({
    decl, url,
    path: resolveUrls ? resolveFile(url, stylesheetContextPath) : url
  }));
};
