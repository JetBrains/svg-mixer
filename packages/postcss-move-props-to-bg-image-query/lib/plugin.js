/* eslint-disable no-param-reassign */
const postcss = require('postcss');
const merge = require('merge-options');
const {
  createMatcher,
  postcss: postcssUtils
} = require('svg-mixer-utils');

const { name: packageName } = require('../package.json');

const transformDeclsToQuery = require('./utils/transform-declarations-to-query');

/**
 * @typedef {Object} PluginConfig
 * @property {RegExp|string|Array<RegExp|string>} match Which props (declarations) should be processed. Glob wildcard can be used, e.g. 'stroke-*'.
 * @property {Function<(postcss.Declaration): { name: string, value: string }>} transform How prop name & value should be transformed to become a query string parameter.
 */
const defaultConfig = {
  match: '-svg-*',
  transform: ({ name, value }) => ({
    name: name.replace(/^-svg-/, ''),
    value
  })
};

module.exports = postcss.plugin(packageName, config => {
  const cfg = merge(defaultConfig, config);
  const declNameMatcher = createMatcher(cfg.match);

  return root => {
    root.walkRules(rule => {
      const bgDecls = postcssUtils.findBgDecls(rule);

      const declsToMove = [];

      rule.walkDecls(decl => {
        if (declNameMatcher(decl.prop)) {
          declsToMove.push(decl);
        }
      });

      if (!bgDecls.length || !declsToMove.length) {
        return;
      }

      const query = transformDeclsToQuery(declsToMove, cfg.transform);

      bgDecls.forEach(({ decl, helper }) => {
        helper.URIS.forEach(url => url.setSearch(query));
        decl.value = helper.getModifiedRule();
      });

      declsToMove.forEach(d => d.remove());
    });
  };
});
