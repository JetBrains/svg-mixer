/* eslint-disable no-param-reassign */
const postcss = require('postcss');
const merge = require('merge-options');
const postcssCustomProps = require('postcss-custom-properties');
const {
  createMatcher,
  postcss: postcssUtils
} = require('svg-mixer-utils');

const { name: packageName } = require('./package.json');
const {
  declsToObject,
  computeCustomProps
} = require('./utils');

/**
 * @typedef {Object} PluginConfig
 * @property {RegExp|string|Array<RegExp|string>} match Which props (declarations) should be processed. Glob wildcard can be used, e.g. 'stroke-*'.
 * @property {Function<(postcss.Declaration): { name: string, value: string }>} transform How prop name & value should be transformed to become a query string parameter.
 * @property {boolean|postcss.Processor} computeCustomProps=false
 */
const defaultConfig = {
  match: '-svg-mixer-*',
  computeCustomProps: false,
  transform: ({ name, value }) => ({
    name: name.replace(/^-svg-mixer-/, ''),
    value
  })
};

module.exports = postcss.plugin(packageName, config => {
  const cfg = merge(defaultConfig, config);
  const declNameMatcher = createMatcher(cfg.match);

  let processor;
  if (cfg.computeCustomProps === true || typeof cfg.computeCustomProps === 'function') {
    processor = typeof cfg.computeCustomProps === 'function'
      ? cfg.computeCustomProps
      : postcss([postcssCustomProps({ preserve: false })]);
  }

  return async (root, result) => {
    const promisees = [];

    root.walkRules(rule => {
      const promise = Promise.resolve().then(async () => {
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

        if (cfg.computeCustomProps) {
          await computeCustomProps(declsToMove, result, processor);
        }

        const query = declsToObject(declsToMove, cfg.transform);

        bgDecls.forEach(({ decl, helper }) => {
          helper.URIS.forEach(url => {
            url.setSearch(query);
            // TODO use humane URL parsing lib
            url._parts.query = url._parts.query.replace(/\+/g, '%20');
          });
          decl.value = helper.getModifiedRule();
        });

        declsToMove.forEach(d => d.remove());
      });

      promisees.push(promise);
    });

    return Promise.all(promisees);
  };
});
