module.exports = {
  prettify: {
    type: 'boolean'
  },
  spriteConfig: {
    type: 'object'
  },
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
};
