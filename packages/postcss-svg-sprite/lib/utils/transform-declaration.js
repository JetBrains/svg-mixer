const postcss = require('postcss');

/**
 * @param {string} selector
 * @param {Function} transformer
 * @returns {string}
 */
function transformSelector(selector, transformer) {
  return selector.split(',').map(s => transformer(s)).join(',');
}

function objectToProps(object) {
  return Object.keys(object).map(key => ({
    prop: key,
    value: object[key]
  }));
}

module.exports = function transformDeclaration(decl, position, spriteFilename) {
  const rule = decl.parent;
  const { aspectRatio, bgSize, bgPosition } = position;
  const { width, height } = bgSize;
  const { top, left } = bgPosition;

  const beforeRule = postcss
    .rule({ selector: transformSelector(rule.selector, s => `${s}::before`) })
    .append(...objectToProps({
      display: 'block',
      'box-sizing': 'content-box',
      'padding-bottom': aspectRatio.toPercent(),
      content: '\'\''
    }));

  const afterRule = postcss
    .rule({ selector: transformSelector(rule.selector, s => `${s}::after`) })
    .append(...objectToProps({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `url('${spriteFilename}') no-repeat ${left.toPercent()} ${top.toPercent()}`,
      'background-size': `${width.toPercent()} ${height.toPercent()}`,
      content: '\'\''
    }));

  const hasPosRelative = rule
    .some(({ prop, value }) => prop === 'position' && value === 'relative');

  !hasPosRelative && rule.append({ prop: 'position', value: 'relative' });

  rule.parent.insertAfter(rule, beforeRule);
  rule.parent.insertAfter(beforeRule, afterRule);

  decl.remove();

  return rule;
};
