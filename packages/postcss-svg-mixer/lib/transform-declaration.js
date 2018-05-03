const postcss = require('postcss');
const { Sprite, StackSprite } = require('svg-mixer');
const { transformSelector, objectToDeclProps } = require('svg-mixer-utils/lib/postcss');

function generateProps(position, spriteUrl, spriteType) {
  const { bgSize, bgPosition } = position;

  const props = {
    [Sprite.TYPE]: {
      background: `url('${spriteUrl}') no-repeat ${bgPosition.left} ${bgPosition.top}`,
      'background-size': `${bgSize.width} ${bgSize.height}`
    },
    [StackSprite.TYPE]: {
      background: `url('${spriteUrl}') no-repeat`
    }
  };

  return objectToDeclProps(props[spriteType]);
}

/**
 * @param {Object} opts
 * @param {postcss.Declaration} opts.decl
 * @param {string} opts.spriteUrl
 * @param {string} opts.spriteType
 * @param {string} opts.selector
 * @param {SpriteSymbolPosition} opts.position
 */
module.exports = opts => {
  const { decl, spriteUrl, spriteType, selector, position } = opts;

  const rule = decl.parent;

  if (typeof selector === 'string') {
    const newSelector = transformSelector(rule.selector, s => `${s}${selector}`);
    const newRule = postcss
      .rule({ selector: newSelector })
      .append(...generateProps(position, spriteUrl, spriteType));

    rule.after(newRule);
  } else {
    rule.append(...generateProps(position, spriteUrl, spriteType));
  }

  decl.remove();
};
