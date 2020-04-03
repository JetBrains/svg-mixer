/* eslint-disable func-names,consistent-this,new-cap,consistent-return */
const merge = require('lodash.merge');
const mixer = require('svg-mixer');
const { validate } = require('svg-mixer-utils');
const { interpolateName, getOptions: getLoaderOptions } = require('loader-utils');

const { name: packageName } = require('../package.json');
const schemas = require('../schemas');

const { configurator: configure, helpers } = require('./utils');

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

  /*
    Ugly crunch to prevent false-positive warning when using extract-text-webpack-plugin
    TODO remove this when drop webpack 3 support
   */
  const isExtractTextPluginCompilation =
    loader._compiler.name &&
    loader._compiler.name.startsWith('extract-text-webpack-plugin');

  const allSymbols = Array.from(plugin.compiler.symbols.values());
  const idAlreadyExists = allSymbols.some(s => s.id === symbol.id);

  if (idAlreadyExists && !isExtractTextPluginCompilation) {
    const warningText = [
      `Symbol with id "${symbol.id}" already exists.`,
      'It happens when you require SVGs with the same file name from different folders.',
      'Set "symbolId" option to more specific, e.g. "[path]-[name]-[hash]"'
    ].join(' ');

    loader.emitWarning(new Error(warningText));
  }

  plugin.compiler.addSymbol(symbol);
  plugin.prevResult = null;

  const runtime = new config.runtimeGenerator(symbol, config).generate();

  callback(null, runtime, sourcemap, meta);
};
