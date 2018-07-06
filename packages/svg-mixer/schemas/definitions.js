module.exports = {
  spriteConfig: {
    type: 'object',
    additionalProperties: true,
    properties: {
      filename: {
        type: 'string'
      },
      attrs: {
        type: 'object'
      },
      usages: {
        type: 'boolean'
      },
      spacing: {
        type: 'integer'
      },
      usageClassName: {
        type: 'string'
      },
      styles: {
        type: 'string'
      }
    }
  }
};
