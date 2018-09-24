const merge = require('lodash.merge');
const mixer = require('svg-mixer');

const { plugin: defaultConfig } = require('../config');

/**
 * @param {ExtractSvgSpritePluginConfig} cfg
 * @return {ExtractSvgSpritePluginConfig}
 */
module.exports = (cfg = {}) => {
  const config = merge({}, defaultConfig, cfg);

  if (!cfg.spriteClass) {
    switch (config.spriteType) {
      default:
      case mixer.Sprite.TYPE:
        config.spriteClass = mixer.Sprite;
        break;

      case mixer.StackSprite.TYPE:
        config.spriteClass = mixer.StackSprite;
        break;
    }
  }

  return config;
};
