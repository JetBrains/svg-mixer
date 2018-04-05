const postcss = require('postcss');

const { transformSelector, objectToDeclProps } = require('../utils');

/**
 * @param {postcss.Declaration} decl
 * @param {string} url
 * @param {SpriteSymbolPosition} position
 */
module.exports = (decl, url, position) => {
  const { bgSize, bgPosition } = position;
  const rule = decl.parent;

  const newRule = postcss
    .rule({ selector: transformSelector(rule.selector, s => `${s}::after`) })
    .append(...objectToDeclProps({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `url('${url}') no-repeat ${bgPosition.left} ${bgPosition.top}`,
      'background-size': `${bgSize.width} ${bgSize.height}`,
      content: '""'
    }));

  const shouldAddPosition = !rule
    .some(({ prop, value }) => prop === 'position' && value.match(/relative|absolute/));

  if (shouldAddPosition) {
    rule.append({ prop: 'position', value: 'relative' });
  }

  rule.parent.insertAfter(rule, newRule);

  decl.remove();
};
