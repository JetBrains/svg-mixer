module.exports.createBaseConfig = require('./create-base-config');
module.exports.createCompiler = require('./create-compiler');
module.exports.featureDetector = require('./feature-detector');
module.exports.RemoveAssetsPlugin = require('./remove-assets-plugin');

/**
 * @param {webpack.Compilation} compilation
 * @returns {Object<{name: string, content: string}>}
 */
module.exports.getAssets = (compilation) =>
  Object.keys(compilation.assets).reduce((acc, name) => {
    acc[name] = compilation.assets[name].source().toString().trim();
    return acc;
  }, {});
