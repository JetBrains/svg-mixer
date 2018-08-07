const {
  spriteClass,
  spriteConfig,
  spriteType,
  symbolClass
} = require('svg-mixer/schemas/defs');

const emit = {
  type: 'boolean',
  default: true
};

const filename = {
  type: 'string'
};

const publicPath = {
  type: 'string'
};

const runtimeFields = {
  type: 'array',
  items: {
    type: 'string',
    enum: [
      'id',
      'width',
      'height',
      'viewBox',
      'url',
      'toString',
      'bgPosition',
      'bgSize',
      'style'
    ]
  },
  minItems: 1,
  uniqueItems: true
};

const selector = {
  type: 'string'
};

const symbolId = {
  instanceof: ['Function', 'String']
};

module.exports.cssLoader = {
  type: 'object',
  additionalProperties: false,
  properties: {
    selector
  }
};

module.exports.loader = {
  type: 'object',
  additionalProperties: false,
  properties: {
    emit,
    filename,
    publicPath,
    runtimeFields,
    symbolId,
    spriteClass,
    spriteConfig,
    spriteType,
    symbolClass
  }
};

module.exports.plugin = {
  type: 'object',
  additionalProperties: false,
  properties: {
    emit,
    filename,
    publicPath,
    runtimeFields,
    selector,
    spriteClass,
    spriteConfig,
    spriteType,
    symbolClass,
    symbolId
  }
};
