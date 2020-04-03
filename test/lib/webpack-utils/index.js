module.exports.createBaseConfig = require('./create-base-config');
module.exports.createCompiler = require('./create-compiler');
module.exports.featureDetector = require('./feature-detector');
module.exports.RemoveAssetsPlugin = require('./remove-assets-plugin');

module.exports.getAssets = compilation =>
  Object
    .keys(compilation.assets)
    .map(name => ({
      name,
      content: compilation.assets[name].source().toString().trim()
    }));
