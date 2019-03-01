const fs = require('fs');

const mixer = require('svg-mixer');

const RuntimeGenerator = require('./utils/runtime-generator');

/**
 * @typedef {Object} ExtractSvgSpritePluginConfig
 * @property {string|function(path, query)} symbolId='[name]'
 * @property {string|function(path, query)} filename='sprite.svg'
 * @property {boolean} emit=true
 * @property {string} publicPath
 * @property {RuntimeGenerator} runtimeGenerator
 * @property {string} selector=null
 * @property {string} spriteType 'classic' | 'stack'
 * @property {mixer.Sprite} spriteClass
 * @property {mixer.SpriteSymbol} symbolClass
 */

module.exports = {
  CSS_LOADER_PATH: require.resolve('./css-loader'),
  LOADER_PATH: require.resolve('./loader'),
  NAMESPACE: fs.realpathSync(__dirname),

  /**
   * @return {ExtractSvgSpritePluginConfig}
   */
  plugin: {
    emit: true,
    filename: 'sprite.svg',
    publicPath: undefined,
    runtimeGenerator: RuntimeGenerator,
    selector: '',
    spriteClass: mixer.Sprite,
    spriteConfig: {
      usageIdSuffix: '-usage'
    },
    spriteType: mixer.Sprite.TYPE,
    symbolClass: mixer.SpriteSymbol,
    symbolId: '[name]'
  }
};
