const path = require('path');

const { createUrlsHelper } = require('postcss-helpers');
const { resolveFile, findCssBgImageDecls } = require('svg-baker-utils');

/**
 * @param {postcss.Root} root
 * @param {Function<string>} [fileMatcher]
 * @return {Promise<Array<{path: string, original: string, query: string, decl: postcss.Declaration}>>}
 */
module.exports = async (root, fileMatcher = null) => {
  const from = root.source.input.file;
  const sourceContextPath = from ? path.dirname(from) : undefined;

  const entries = findCssBgImageDecls(root)
    .map(decl => ({ decl, url: createUrlsHelper(decl.value).URIS[0] }))
    .filter(({ url }) => (fileMatcher ? fileMatcher(url.toString()) : true))
    .map(({ decl, url }) => ({
      decl,
      origin: url.toString(),
      path: url.path(),
      query: url.query() ? `?${url.query()}` : ''
    }));

  for (const entry of entries) {
    entry.absolute = await resolveFile(entry.path, sourceContextPath);
  }

  return entries;
};
