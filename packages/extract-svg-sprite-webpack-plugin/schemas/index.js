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
  instanceof: ['String', 'Function']
};

const publicPath = {
  type: 'string'
};

const runtimeGenerator = {
  instanceof: ['Function']
};

const selector = {
  type: 'string'
};

const symbolId = {
  instanceof: ['Function', 'String']
};

module.exports.plugin = {
  type: 'object',
  additionalProperties: false,
  properties: {
    emit,
    filename,
    publicPath,
    runtimeGenerator,
    selector,
    spriteClass,
    spriteConfig,
    spriteType,
    symbolClass,
    symbolId
  }
};

module.exports.loader = module.exports.plugin;

module.exports.cssLoader = {
  type: 'object',
  additionalProperties: false,
  properties: {
    selector
  }
};
