const { NAMESPACE } = require('../config');

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
