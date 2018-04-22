/* eslint-disable consistent-return */
const { dirname } = require('path');

const { resolveFile, findCssBgImageDecls } = require('svg-mixer-utils');
const { name: packageName } = require('../package.json');

/**
 * @param {postcss.Root} root
 * @param {Function<string>} [fileMatcher]
 * @return {Promise<Array<{path: string, original: string, query: string, decl: postcss.Declaration}>>}
 */
module.exports = async (root, result, fileMatcher = null) => {
  const from = root.source.input.file;
  const sourceContextPath = from ? dirname(from) : undefined;

  const entries = findCssBgImageDecls(root)
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
        if (e.code === 'NOT_FOUND') {
          const msg = `${entry.origin} not found. Requested from ${from}`;
          entry.decl.warn(result, msg, { plugin: packageName });
          entry.absolute = null;
          return entry;
        }
        return Promise.reject(e);
      }));

  return Promise.all(resolvePromises)
    .then(res => res.filter(entry => !!entry.absolute));
};
