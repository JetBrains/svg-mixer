/* eslint-disable func-names,consistent-this,new-cap,consistent-return */
const merge = require('lodash.merge');
const mixer = require('svg-mixer');
const { validate } = require('svg-mixer-utils');
const { interpolateName, getOptions: getLoaderOptions } = require('loader-utils');

const { name: packageName } = require('../package.json');
const schemas = require('../schemas');

const {
  configurator: configure,
  runtimeGenerator: generateRuntime,
  helpers
} = require('./utils');

module.exports = function (content, sourcemap, meta = {}) {
  const callback = this.async();
  const loader = this;
  const context = loader.rootContext || loader.options.context;
  const plugin = helpers.getPluginFromLoaderContext(loader);

  const config = configure(
    merge({}, plugin.config, getLoaderOptions(loader) || {})
  );

  const errors = validate(schemas.loader, config);
  if (errors.length) {
    const err = new Error(`${packageName}: ${errors.join('\n')}`);
    return callback(err, content, sourcemap, meta);
  }

  const request = loader.resourcePath + loader.resourceQuery;

  const symbolId = typeof config.symbolId === 'function'
    ? config.symbolId(loader.resourcePath, loader.resourceQuery)
    : interpolateName(loader, config.symbolId, { content, context });

  const img = new mixer.Image(request, meta.ast || content);
  const symbol = new config.symbolClass(symbolId, img);

  symbol.config = config;
  symbol.module = loader._module;
  symbol.key = `${loader._module.request}___${loader._module.issuer.request}`;

  plugin.compiler.addSymbol(symbol);

  const runtime = generateRuntime(symbol, config);

  callback(null, runtime, sourcemap, meta);
};
