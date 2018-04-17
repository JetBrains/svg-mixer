const postcss = require('postcss');
const { createUrlsHelper } = require('postcss-helpers');
const merge = require('merge-options');
const {
  createMatcher,
  findCssBgImageDecls
} = require('svg-baker-utils');

const { name: packageName } = require('./package.json');

/**
 * @param {postcss.Rule} rule
 * @param {Function<string>} matcher
 * @return {Array<postcss.Declaration>}
 */
function findDeclsToMove(rule, matcher) {
  const decls = [];
  rule.walkDecls(decl => decls.push(decl));
  return decls.filter(d => matcher(d.prop));
}

/**
 * @param {Array<postcss.Declaration>} decls
 * @param {Function<postcss.Declaration>} transformer
 * @return {Object}
 */
function transformDeclsToQuery(decls, transformer) {
  return decls.reduce((acc, decl) => {
    const { name, value } = transformer({
      name: decl.prop,
      value: decl.value
    });
    // eslint-disable-next-line no-param-reassign
    acc = merge(acc, { [name]: encodeURIComponent(value) });
    return acc;
  }, {});
}


/**
 * @typedef {Object} PluginConfig
 * @property {RegExp|string|Array<RegExp|string>} match Glob pattern for which URLs should be processed.
 * @property {string|Array<string>} props='svg-*' Which props (declarations) should be processed. Glob wildcard can be used, e.g. 'stroke-*'.
 * @property {Function<(postcss.Declaration): { name: string, value: string }>} transform How prop name & value should be transformed to become a query string parameter.
 * @property {boolean} remove=true Remove moved props from original rule.
 */
const defaultConfig = {
  match: /\.svg($|\?.*$)/,
  props: /^svg-/,
  transform: ({ name, value }) => ({
    name: name.replace(/^svg-/, ''),
    value
  }),
  remove: true
};

module.exports = postcss.plugin(packageName, config => {
  const cfg = merge(defaultConfig, config);
  const { props, match } = cfg;
  const fileMatcher = createMatcher(match);
  const declsMatcher = createMatcher(props);

  return root => {
    root.walkRules(rule => {
      const bgDecl = findCssBgImageDecls(rule)[0];
      const decls = bgDecl ? findDeclsToMove(rule, declsMatcher) : [];
      const helper = bgDecl && createUrlsHelper(bgDecl.value);
      const matchedUrls = helper ? helper.URIS.filter(url => fileMatcher(url.toString())) : [];

      if (!bgDecl || decls.length === 0 || matchedUrls.length === 0) {
        return;
      }

      const query = transformDeclsToQuery(decls, cfg.transform);
      matchedUrls.forEach(url => url.setSearch(query));
      bgDecl.value = helper.getModifiedRule();

      if (cfg.remove) {
        decls.forEach(d => d.remove());
      }
    });
  };
});
