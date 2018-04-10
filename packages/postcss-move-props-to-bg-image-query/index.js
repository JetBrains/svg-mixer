const postcss = require('postcss');
const { createUrlsHelper } = require('postcss-helpers');
const merge = require('merge-options');
const createFilter = require('include-exclude');

const { name: packageName } = require('./package.json');
const {
  findBgImageDecl,
  findDeclsToMove,
  transformDeclsToQuery
} = require('./utils');

/**
 * @typedef {Object} PluginConfig
 * @property {string|Array<string>} include='*.svg' Glob pattern for which URLs should be processed.
 * @property {string|Array<string>} exclude Glob pattern for which URLs should NOT be processed. Also could be used to filter out some `include` values.
 * @property {string|Array<string>} props='svg-*' Which props (declarations) should be processed. Glob wildcard can be used, e.g. 'stroke-*'.
 * @property {Function} transform How prop name & value should be transformed to become a query string parameter.
 * @property {boolean} remove=true Remove moved props from original rule.
 */
const defaultConfig = {
  include: '*.svg',
  exclude: undefined,
  props: 'svg-*',
  transform: ({ prop: name, value }) => ({
    name: name.replace(/^svg-/, ''),
    value
  }),
  remove: true
};

module.exports = postcss.plugin(packageName, config => {
  const cfg = merge(defaultConfig, config);
  const { include, exclude } = cfg;
  const matcher = createFilter({ include, exclude });

  return root => {
    root.walkRules(rule => {
      const bgDecl = findBgImageDecl(rule);
      const decls = bgDecl ? findDeclsToMove(rule, cfg.props) : [];
      const helper = bgDecl && createUrlsHelper(bgDecl.value);
      const matchedUrls = helper ? helper.URIS.filter(url => matcher(url.toString())) : [];

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
