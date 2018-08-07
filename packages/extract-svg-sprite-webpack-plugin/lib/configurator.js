const merge = require('lodash.merge');
const mixer = require('svg-mixer');

const { plugin: defaultConfig } = require('./config');

/**
 * @param {ExtractSvgSpritePluginConfig} cfg
 * @return {ExtractSvgSpritePluginConfig}
 */
module.exports = (cfg = {}) => {
  const config = merge({}, defaultConfig, cfg);

  switch (config.spriteType) {
    default:
    case mixer.Sprite.TYPE:
      config.spriteClass = mixer.Sprite;

      if (typeof cfg.runtimeFields === 'undefined') {
        config.runtimeFields = config.runtimeFields.concat([
          'bgPosition',
          'bgSize'
        ]);
      }
      break;

    case mixer.StackSprite.TYPE:
      config.spriteClass = mixer.StackSprite;
      break;
  }

  console.log(config.runtimeFields);

  return config;
};
