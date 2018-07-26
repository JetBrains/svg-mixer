/* eslint-disable func-names,consistent-this,new-cap */
const merge = require('merge-options');
const RuleSet = require('webpack/lib/RuleSet');
const { urlToRequest } = require('loader-utils');
const postcss = require('postcss');
const { findBgDecls } = require('svg-mixer-utils/lib/postcss');
const transformDecl = require('postcss-svg-mixer/lib/transform-declaration');

const { LOADER_PATH } = require('./config');
const getPluginFromLoader = require('./utils/get-plugin-from-loader');
const generator = require('./utils/replacement-generator');

module.exports = function (content, sourcemap, meta = {}) {
  const loader = this;
  const callback = this.async();

  // Reuse AST from postcss if available
  const ast = meta && meta.ast && meta.ast.type === 'postcss'
    ? meta.ast.root
    : postcss.parse(content, { from: loader.resourcePath + loader.resourceQuery });

  const resolvePromises = findBgDecls(ast).map(({ decl, helper }) => {
    helper.rawRequest = helper.URIS[0].toString();

    return new Promise((resolve, reject) => {
      loader.resolve(
        loader.context,
        urlToRequest(helper.rawRequest, loader.context),
        (err, result) => (err ? reject(err) : resolve(result))
      );
    })
      .then(resovled => (helper.resolved = resovled))
      .then(() => ({ decl, helper }));
  });

  const plugin = getPluginFromLoader(loader);
  const ruleMatcher = new RuleSet(loader._compiler.options.module.rules);

  Promise.all(resolvePromises).then(data => {
    data.forEach(({ decl, helper }) => {
      const url = helper.URIS[0];
      const request = helper.resolved;

      const matchedRules = ruleMatcher.exec({
        resource: url.path(),
        resourceQuery: url.query(),
        issuer: loader._module.issuer,
        compiler: loader._compiler
      });

      const svgLoaderRule = matchedRules.find(r => r.value.loader === LOADER_PATH);

      if (!svgLoaderRule) {
        return;
      }

      const svgLoaderOpts = svgLoaderRule ? svgLoaderRule.value.options : {};
      const { spriteType, selector } = merge(plugin.config, svgLoaderOpts);

      const transformOpts = {
        decl,
        spriteUrl: url.toString(),
        spriteType,
        selector,
        position: {
          bgPosition: {
            left: generator.bgPosLeft(request).token,
            top: generator.bgPosTop(request).token
          },
          bgSize: {
            width: generator.bgSizeWidth(request).token,
            height: generator.bgSizeHeight(request).token
          }
        }
      };

      transformDecl(transformOpts);
    });

    const result = ast.toString();

    callback(null, result, sourcemap, meta);
  }).catch(callback);
};
