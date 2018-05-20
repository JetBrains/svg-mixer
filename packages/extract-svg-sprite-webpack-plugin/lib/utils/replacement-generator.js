const mixer = require('svg-mixer');
const { getHashDigest } = require('loader-utils');

const { NAMESPACE } = require('../config');

const TOKEN_START = '___';
const TOKEN_END = '___';

const REPLACEMENTS = {
  SPRITE_FILENAME: 'sprite_filename',
  SYMBOL_BG_POSITION_LEFT: 'symbol_bg_position_left',
  SYMBOL_BG_POSITION_TOP: 'symbol_bg_position_top',
  SYMBOL_BG_SIZE_WIDTH: 'symbol_bg_size_width',
  SYMBOL_BG_SIZE_HEIGHT: 'symbol_bg_size_height'
};

function generate(id, replacementName = '') {
  const value = [
    NAMESPACE,
    id,
    replacementName && `:${replacementName}`
  ].filter(Boolean).join('');

  return `${TOKEN_START}${getHashDigest(value)}${TOKEN_END}`;
}

module.exports = class Generator {
  static symbolRequest(symbol, config) {
    const { filename, emit } = config;
    let replaceTo;

    if (!filename || !emit) {
      replaceTo = `#${symbol.id}`;
    } else {
      replaceTo = config.spriteType === mixer.StackSprite.TYPE
        ? `${filename}#${symbol.id}`
        : filename;
    }

    return {
      value: generate(REPLACEMENTS.SPRITE_FILENAME, symbol.request),
      replaceTo
    };
  }

  static bgPosLeft(request, position) {
    return {
      value: generate(REPLACEMENTS.SYMBOL_BG_POSITION_LEFT, request),
      replaceTo: position ? position.bgPosition.left : undefined
    };
  }

  static bgPosTop(request, position) {
    return {
      value: generate(REPLACEMENTS.SYMBOL_BG_POSITION_TOP, request),
      replaceTo: position ? position.bgPosition.top : undefined
    };
  }

  static bgSizeWidth(request, position) {
    return {
      value: generate(REPLACEMENTS.SYMBOL_BG_SIZE_WIDTH, request),
      replaceTo: position ? position.bgSize.width : undefined
    };
  }

  static bgSizeHeight(request, position) {
    return {
      value: generate(REPLACEMENTS.SYMBOL_BG_SIZE_HEIGHT, request),
      replaceTo: position ? position.bgSize.height : undefined
    };
  }

  static symbol({ symbol, position, config }) {
    const { request } = symbol;

    // css replacements
    const replacements = [
      Generator.symbolRequest(symbol, config),
      Generator.bgPosLeft(request, position),
      Generator.bgPosTop(request, position),
      Generator.bgSizeWidth(request, position),
      Generator.bgSizeHeight(request, position)
    ];

    return replacements.reduce((acc, replacement) => {
      acc[replacement.value] = replacement.replaceTo;
      return acc;
    }, {});
  }
};

module.exports.REPLACEMENTS = REPLACEMENTS;
