const postcss = require('postcss');

const { transformSelector, objectToDeclProps } = require('../utils');
const FORMAT = require('../utils/format');

const PROPER_POSITION = /relative|absolute|fixed/;

/**
 * @param {Object} opts
 * @param {postcss.Declaration} opts.decl
 * @param {string} opts.spriteUrl
 * @param {SpriteSymbolPosition} opts.position
 * @param {string} opts.format 'plain' | 'flexible'
 */
module.exports = opts => {
  const { decl, spriteUrl, position, format } = opts;
  const { bgSize, bgPosition } = position;

  const rule = decl.parent;
  const selector = rule.selector;

  switch (format) {
    default:
    case FORMAT.PLAIN:
      rule.append(...objectToDeclProps({
        background: `url('${spriteUrl}') no-repeat ${bgPosition.left} ${bgPosition.top}`,
        'background-size': `${bgSize.width} ${bgSize.height}`
      }));
      break;

    case FORMAT.FULL:
      const hasProperPosition = rule
        .some(({ prop, value }) => prop === 'position' && value.match(PROPER_POSITION));

      if (!hasProperPosition) {
        rule.append({ prop: 'position', value: 'relative' });
      }

      const newRule = postcss
        .rule({ selector: transformSelector(selector, s => `${s}::after`) })
        .append(...objectToDeclProps({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `url('${spriteUrl}') no-repeat ${bgPosition.left} ${bgPosition.top}`,
          'background-size': `${bgSize.width} ${bgSize.height}`,
          content: '\'\''
        }));

      rule.after(newRule);

      break;
  }

  decl.remove();
};

