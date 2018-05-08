const { NAMESPACE } = require('./config');

module.exports.getPluginFromLoader = loaderContext => {
  const { _compiler: compiler } = loaderContext;

  const parentCompiler = compiler.isChild()
    ? compiler.parentCompilation.compiler
    : null;

  return parentCompiler
    ? parentCompiler.options.plugins.find(p => p.NAMESPACE && p.NAMESPACE === NAMESPACE)
    : loaderContext[NAMESPACE];
};
