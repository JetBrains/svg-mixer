const fs = require('fs');

const mixer = require('svg-mixer');

/**
 * @typedef {Object} ExtractSvgSpritePluginConfig
 * @property {string|function(path, query)} symbolId='[name]'
 * @property {string|function(path, query)} filename='sprite.svg'
 * @property {boolean} emit=true
 * @property {string[]} runtimeFields
 * @property {string} selector=null
 * @property {string} spriteType 'classic' | 'stack'
 * @property {mixer.Sprite} spriteClass
 * @property {mixer.SpriteSymbol} symbolClass
 */

module.exports = {
  NAMESPACE: fs.realpathSync(__dirname),
  LOADER_PATH: require.resolve('./loader'),
  CSS_LOADER_PATH: require.resolve('./css-loader'),
  NO_SPRITE_FILENAME: '_',

  /**
   * @return {ExtractSvgSpritePluginConfig}
   */
  get plugin() {
    return {
      spriteType: mixer.Sprite.TYPE,
      symbolId: '[name]',
      filename: 'sprite.svg',
      emit: true,
      publicPath: undefined,
      runtimeFields: [
        'id',
        'width',
        'height',
        'viewBox',
        'url',
        'toString'
      ],
      selector: undefined,
      spriteConfig: undefined,
      spriteClass: mixer.Sprite,
      symbolClass: mixer.SpriteSymbol
    };
  }
};
