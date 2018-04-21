const path = require('path');

const { resolveFile, findCssBgImageDecls } = require('svg-mixer-utils');

/**
 * @param {postcss.Root} root
 * @param {Function<string>} [fileMatcher]
 * @return {Promise<Array<{path: string, original: string, query: string, decl: postcss.Declaration}>>}
 */
module.exports = async (root, fileMatcher = null) => {
  const from = root.source.input.file;
  const sourceContextPath = from ? path.dirname(from) : undefined;

  const entries = findCssBgImageDecls(root)
    .map(({ decl, helper }) => ({ decl, url: helper.URIS[0] }))
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
