/* eslint-disable func-names,consistent-this,new-cap */
const merge = require('merge-options');
const mixer = require('svg-mixer');
const { interpolateName, getOptions } = require('loader-utils');

const generateRuntime = require('./utils/generate-runtime');
const getPluginFromLoader = require('./utils/get-plugin-from-loader');

module.exports = function (content, sourcemap, meta = {}) {
  const callback = this.async();
  const loader = this;
  const context = loader.rootContext || loader.options.context;
  const plugin = getPluginFromLoader(loader);
  const config = merge(plugin.config, getOptions(loader) || {});
  const request = loader.resourcePath + loader.resourceQuery;

  const symbolId = typeof config.symbolId === 'function'
    ? config.symbolId(loader.resourcePath, loader.resourceQuery)
    : interpolateName(loader, config.symbolId, { content, context });

  const img = new mixer.Image(request, meta.ast || content);
  const symbol = new config.symbolClass(symbolId, img);

  symbol.options = config;
  symbol.module = loader._module;
  symbol.request = request;
  plugin.addSymbol(symbol);

  const runtime = generateRuntime(symbol, config.runtimeFields);

  callback(null, `module.exports = ${runtime}`, sourcemap, meta);
};
