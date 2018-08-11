/* eslint-disable func-names,consistent-this,new-cap */
const merge = require('lodash.merge');
const mixer = require('svg-mixer');
const { interpolateName, getOptions } = require('loader-utils');

const {
  configurator: configure,
  runtimeGenerator: generateRuntime,
  helpers
} = require('./utils');

module.exports = function (content, sourcemap, meta = {}) {
  const callback = this.async();
  const loader = this;
  const context = loader.rootContext || loader.options.context;
  const module = this._module;
  // const request = loader.resourcePath + loader.resourceQuery;
  const plugin = helpers.getPluginFromLoaderContext(loader);
  /**
   * @type {ExtractSvgSpritePluginConfig|defaultConfig}
   */
  const config = configure(merge({}, plugin.config, getOptions(loader) || {}));
  const request = loader.resourcePath + loader.resourceQuery;

  const symbolId = typeof config.symbolId === 'function'
    ? config.symbolId(module)
    : interpolateName(loader, config.symbolId, { content, context });

  const img = new mixer.Image(request, meta.ast || content);
  const symbol = new config.symbolClass(symbolId, img);

  symbol.config = config;
  symbol.module = module;
  symbol.key = `${module.request}___${module.issuer.request}`;

  plugin.compiler.addSymbol(symbol);

  callback(null, generateRuntime(symbol, config), sourcemap, meta);
};
