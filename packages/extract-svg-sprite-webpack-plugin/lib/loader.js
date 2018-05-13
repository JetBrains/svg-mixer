/* eslint-disable func-names,consistent-this,new-cap */
const merge = require('merge-options');
const mixer = require('svg-mixer');
const { interpolateName, getOptions } = require('loader-utils');

const generator = require('./utils/replacement-generator');
const getPluginFromLoader = require('./utils/get-plugin-from-loader');

module.exports = function (content, sourcemap, meta = {}) {
  const callback = this.async();
  const loader = this;
  const rootContext = loader.rootContext || loader.options.context;
  const plugin = getPluginFromLoader(loader);
  const config = merge(plugin.config, getOptions(loader) || {});
  const request = loader.resourcePath + loader.resourceQuery;

  const symbolId = interpolateName(loader, config.symbolId, {
    content,
    context: rootContext
  });

  const img = new mixer.Image(request, meta.ast || content);
  const symbol = new config.symbolClass(symbolId, img);

  symbol.options = config;
  symbol.module = loader._module;
  symbol.request = request;
  plugin.addSymbol(symbol);

  const requestReplacement = generator.symbolRequest(symbol).value;

  const runtimeFields = {
    id: `"${symbol.id}"`,
    width: `${symbol.width}`,
    height: `${symbol.height}`,
    viewBox: `"${symbol.viewBox.join(' ')}"`,
    url: `__webpack_public_path__ + "${requestReplacement}"`,
    toString: `function () { return __webpack_public_path__ + "${requestReplacement}"; }`,

    bgPosition: [
      `left: "${generator.bgPosLeft(request).value}"`,
      `top: "${generator.bgPosTop(request).value}"`
    ].join(', '),

    bgSize: [
      `width: "${generator.bgSizeWidth(request).value}"`,
      `height: "${generator.bgSizeHeight(request).value}"`
    ].join(', ')
  };

  const runtime = `{
  ${Object.keys(runtimeFields).map(name => `${name}: ${runtimeFields[name]}`)}
}`;

  callback(null, `module.exports = ${runtime}`, sourcemap, meta);
};
