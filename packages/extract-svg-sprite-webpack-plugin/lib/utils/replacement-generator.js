const mixer = require('svg-mixer');
const { getHashDigest } = require('loader-utils');

const { NAMESPACE } = require('../config');

const Replacements = {
  PUBLIC_PATH: 'public_path',
  SPRITE_FILENAME: 'sprite_filename',
  SYMBOL_BG_POSITION_LEFT: 'symbol_bg_position_left',
  SYMBOL_BG_POSITION_TOP: 'symbol_bg_position_top',
  SYMBOL_BG_SIZE_WIDTH: 'symbol_bg_size_width',
  SYMBOL_BG_SIZE_HEIGHT: 'symbol_bg_size_height'
};

/**
 * @param {string} id
 * @return {string}
 */
function generateToken(id) {
  const value = [
    NAMESPACE,
    id
  ].filter(Boolean).join('');

  return `___${getHashDigest(value)}___`;
}

class Replacement {
  constructor(token, replaceTo) {
    this.token = generateToken(token);
    this.replaceTo = replaceTo;
  }
}

class ReplacementGenerator {
  /**
   * @param {SpriteSymbol} symbol
   * @param {Object} config
   * @param {string} config.filename
   * @param {boolean} config.emit
   * @param {string} config.spriteType
   * @return {Replacement}
   */
  static symbolUrl(symbol, config) {
    const { filename, emit, spriteType, sriteConfig } = config;
    let replaceTo;

    if (!filename || !emit) {
      replaceTo = `#${symbol.id}`;
    } else {
      replaceTo = spriteType === mixer.StackSprite.TYPE
        ? `${filename}#${symbol.id}${sriteConfig.usageIdSuffix}`
        : filename;
    }

    return new Replacement(
      `${Replacements.SPRITE_FILENAME}:${symbol.request}`,
      replaceTo
    );
  }

  /**
   * @param {string} symbolUrl
   * @param {SpriteSymbolPosition} position
   * @return {Replacement}
   */
  static bgPosLeft(symbolUrl, position) {
    return new Replacement(
      `${Replacements.SYMBOL_BG_POSITION_LEFT}:${symbolUrl}`,
      position ? position.bgPosition.left : undefined
    );
  }

  /**
   * @param {string} symbolUrl
   * @param {SpriteSymbolPosition} position
   * @return {Replacement}
   */
  static bgPosTop(symbolUrl, position) {
    return new Replacement(
      `${Replacements.SYMBOL_BG_POSITION_TOP}:${symbolUrl}`,
      position ? position.bgPosition.top : undefined
    );
  }

  /**
   * @param {string} symbolUrl
   * @param {SpriteSymbolPosition} position
   * @return {Replacement}
   */
  static bgSizeWidth(symbolUrl, position) {
    return new Replacement(
      `${Replacements.SYMBOL_BG_SIZE_WIDTH}:${symbolUrl}`,
      position ? position.bgSize.width : undefined
    );
  }

  /**
   * @param {string} symbolUrl
   * @param {SpriteSymbolPosition} position
   * @return {Replacement}
   */
  static bgSizeHeight(symbolUrl, position) {
    return new Replacement(
      `${Replacements.SYMBOL_BG_SIZE_HEIGHT}:${symbolUrl}`,
      position ? position.bgSize.height : undefined
    );
  }
}

module.exports = ReplacementGenerator;
module.exports.Replacement = Replacement;
module.exports.generateToken = generateToken;
module.exports.Replacements = Replacements;
