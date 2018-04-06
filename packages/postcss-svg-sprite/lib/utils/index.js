module.exports.collectDeclarationsToProcess = require('./collect-declarations-to-process');
module.exports.resolveFile = require('./resolve-file');

/**
 * @param {string} selector
 * @param {Function} transformer
 * @returns {string}
 */
module.exports.transformSelector = function transformSelector(selector, transformer) {
  return selector.split(',').map(s => transformer(s)).join(',');
};

/**
 * @param {Object} object
 * @return {Array<{prop: string, value: string}>}
 */
module.exports.objectToDeclProps = function objectToProps(object) {
  return Object.keys(object).map(key => ({
    prop: key,
    value: object[key]
  }));
};
