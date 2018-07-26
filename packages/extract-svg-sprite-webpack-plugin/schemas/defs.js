const {
  spriteClass,
  spriteConfig,
  spriteType,
  symbolClass
} = require('svg-mixer/schemas/defs');

module.exports = {
  emit: {
    type: 'boolean',
    default: true
  },
  filename: {
    type: 'string'
  },
  publicPath: {
    type: 'string'
  },
  runtimeFields: {
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
  },
  selector: {
    type: 'string'
  },
  spriteClass,
  spriteConfig,
  spriteType,
  symbolClass,
  symbolId: {
    instanceof: ['Function', 'String']
  }
};
