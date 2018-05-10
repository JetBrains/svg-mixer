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
  const cfg = merge(plugin.config, getOptions(loader) || {});
  const request = loader.resourcePath + loader.resourceQuery;

  const symbolId = interpolateName(loader, cfg.symbolId, {
    content,
    context: rootContext
  });

  const img = new mixer.Image(request, meta.ast || content);
  const symbol = new cfg.symbolClass(symbolId, img);

  symbol.options = cfg;
  symbol.module = loader._module;
  symbol.request = request;
  plugin.addSymbol(symbol);

  const replacement = generator.symbolRequest(symbol).value;
  callback(null, `module.exports = ${JSON.stringify(replacement)}`, sourcemap, meta);
};
