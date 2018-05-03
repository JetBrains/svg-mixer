/* eslint-disable consistent-return */
const { dirname } = require('path');

const { resolveFile, postcss: postcssUtils } = require('svg-mixer-utils');

/**
 * TODO refactor this ugly code!
 * @param {postcss.Root} root
 * @param {Function<string>} [fileMatcher]
 * @return {Promise<Array<{path: string, original: string, query: string, decl: postcss.Declaration}>>}
 */
module.exports = async (root, fileMatcher) => {
  const from = root.source.input.file;
  const sourceContextPath = from ? dirname(from) : undefined;

  const entries = postcssUtils.findBgDecls(root)
    .map(({ decl, helper }) => ({ decl, url: helper.URIS[0] }))
    .filter(({ url }) => (fileMatcher ? fileMatcher(url.toString()) : true))
    .map(({ decl, url }) => ({
      decl,
      origin: url.toString(),
      path: url.path(),
      query: url.query() ? `?${url.query()}` : ''
    }));

  const resolvePromises = entries.map(entry =>
    resolveFile(entry.path, sourceContextPath)
      .then(p => {
        entry.absolute = p;
        return entry;
      })
      .catch(e => {
        let error = e;
        const { decl } = entry;
        if (e.code === 'NOT_FOUND') {
          const msg = `${entry.origin} not found`;
          error = decl.error(msg, { word: decl.prop });
        }
        return Promise.reject(error);
      }));

  return Promise.all(resolvePromises)
    .then(res => res.filter(entry => !!entry.absolute));
};
