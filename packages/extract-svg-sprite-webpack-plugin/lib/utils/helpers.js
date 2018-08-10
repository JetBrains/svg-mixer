/* eslint-disable no-magic-numbers */
const { NAMESPACE } = require('../config');

/**
 * Find nearest module chunk (not sure that is reliable method, but who cares).
 * @see http://stackoverflow.com/questions/43202761/how-to-determine-all-module-chunks-in-webpack
 * @param {NormalModule} module
 * @return {Chunk|null}
 */
function getModuleChunk(module) {
  let chunks;
  const webpackVersion = getWebpackMajorVersion();

  if (webpackVersion >= 4) {
    chunks = Array.from(module.chunksIterable);
  } else if (webpackVersion >= 3) {
    chunks = module.mapChunks();
  } else {
    chunks = module.chunks;
  }

  if (Array.isArray(chunks) && chunks.length > 0) {
    return chunks[chunks.length - 1];
  } else if (module.issuer) {
    return getModuleChunk(module.issuer);
  }

  return null;
}

module.exports.getModuleChunk = getModuleChunk;

/**
 * @return {number}
 */
function getWebpackMajorVersion() {
  const v = require('webpack/package.json').version.split('.')[0];
  return parseInt(v, 10);
}

module.exports.getWebpackMajorVersion = getWebpackMajorVersion;

/**
 * @param {Compilation} compilation
 * @return {boolean}
 */
function isHtmlPluginCompilation(compilation) {
  return (
    compilation.compiler.name &&
    compilation.compiler.name.startsWith('html-webpack-plugin')
  );
}

module.exports.isHtmlPluginCompilation = isHtmlPluginCompilation;

/**
 * @param {Compilation} compilation
 * @return {boolean}
 */
function isMiniExtractCompilation(compilation) {
  return (
    compilation.compiler.name &&
    compilation.compiler.name.startsWith('mini-css-extract-plugin')
  );
}

module.exports.isMiniExtractCompilation = isMiniExtractCompilation;

/**
 * @param {Compilation} compilation
 * @return {Compilation}
 */
function getRootCompilation(compilation) {
  return compilation.compiler.isChild()
    ? compilation.compiler.parentCompilation
    : compilation;
}

module.exports.getRootCompilation = getRootCompilation;

/**
 * @param {Object} loaderContext
 * @return {ExtractSvgSpritePlugin}
 */
function getPluginFromLoaderContext(loaderContext) {
  const { _compiler: compiler } = loaderContext;

  const parentCompiler = compiler.isChild()
    ? compiler.parentCompilation.compiler
    : null;

  return parentCompiler
    ? parentCompiler.options.plugins.find(p => p.NAMESPACE && p.NAMESPACE === NAMESPACE)
    : loaderContext[NAMESPACE];
}

module.exports.getPluginFromLoaderContext = getPluginFromLoaderContext;
