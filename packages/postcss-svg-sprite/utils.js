const path = require('path');
const { promisify } = require('util');
const stat = promisify(require('fs').lstat);

const postcss = require('postcss');

/**
 * @param {string} filepath
 * @param {string} [context] Context directory.
 * @returns {Promise<string>}
 */
module.exports.resolveFile = function resolveFile(filepath, context = process.cwd()) {
  let resolvedPath;
  const resolveAsNodeModule = filepath.startsWith('~');

  if (resolveAsNodeModule) {
    try {
      resolvedPath = require.resolve(filepath.substr(1));
    } catch (e) {
      return Promise.reject(new Error(filepath));
    }
  } else {
    resolvedPath = path.resolve(context, filepath);
  }

  return stat(resolvedPath).then(info => {
    return info.isFile()
      ? resolvedPath
      : Promise.reject(new Error(resolvedPath));
  });
};

/**
 * @param {string} selector
 * @param {Function} transformer
 * @returns {string}
 */
function transformMultipleSelector(selector, transformer) {
  return selector.split(',').map(s => transformer(s)).join(',');
}

module.exports.transformMultipleSelector = transformMultipleSelector;

function objectToProps(object) {
  return Object.keys(object).map(key => ({
    prop: key,
    value: object[key]
  }));
}

module.exports.transformRule = function (rule, position, spriteFilename) {
  const { aspectRatio, bgSize, bgPosition } = position;
  const { width, height } = bgSize;
  const { top, left } = bgPosition;

  const beforeRule = postcss
    .rule({ selector: transformMultipleSelector(rule.selector, s => `${s}::before`) })
    .append(...objectToProps({
      display: 'block',
      'box-sizing': 'content-box',
      'padding-bottom': aspectRatio.toPercent(),
      content: '\'\''
    }));

  const afterRule = postcss
    .rule({ selector: transformMultipleSelector(rule.selector, s => `${s}::after`) })
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

  return rule;
};
