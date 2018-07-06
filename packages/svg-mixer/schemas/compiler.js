const { spriteConfig } = require('./definitions');

module.exports = {
  type: 'object',
  additionalProperties: false,
  properties: {
    prettify: {
      type: 'boolean'
    },
    spriteConfig,
    spriteType: {
      type: 'string',
      enum: [
        'classic',
        'stack'
      ]
    },
    spriteClass: {
      instanceOf: 'Function'
    },
    symbolClass: {
      instanceOf: 'Function'
    },
    generateSymbolId: {
      instanceOf: 'Function'
    }
  }
};
