let ConcatenatedModule;
try {
  // eslint-disable-next-line global-require,import/no-unresolved,import/no-extraneous-dependencies
  ConcatenatedModule = require('webpack/lib/optimize/ConcatenatedModule');
  // eslint-disable-next-line no-empty
} catch (e) {}

/* eslint-disable no-magic-numbers */
const { NAMESPACE } = require('../config');

/**
 * Get all modules from main & child compilations.
 * Merge modules from ConcatenatedModule (when webpack.optimize.ModuleConcatenationPlugin is used)
 * @param {Compilation} compilation
 * @return {NormalModule[]}
 */
function getAllModules(compilation) {
  let modules = compilation.modules;

  // Look up in child compilations
  if (compilation.children.length > 0) {
    const childModules = compilation.children.map(getAllModules)
      .reduce((acc, compilationModules) => acc.concat(compilationModules), []);

    modules = modules.concat(childModules);
  }

  // Merge modules from ConcatenatedModule
  if (ConcatenatedModule) {
    const concatenatedModules = modules
      .filter(m => m instanceof ConcatenatedModule)
      .reduce((acc, m) => {
        /**
         * @see https://git.io/v7XDu
         * In webpack@3.5.1 `modules` public property was removed
         * To workaround this private `_orderedConcatenationList` property is used to collect modules
         */
        const subModules = 'modules' in m
          ? m.modules
          : m._orderedConcatenationList.map(entry => entry.module);

        return acc.concat(subModules);
      }, []);

    if (concatenatedModules.length > 0) {
      modules = modules.concat(concatenatedModules);
    }
  }

  return modules.filter(m => m.rawRequest);
}

module.exports.getAllModules = getAllModules;


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
