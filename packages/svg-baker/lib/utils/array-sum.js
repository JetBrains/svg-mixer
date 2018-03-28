/**
 * @param {Array} array
 * @return {number}
 */
module.exports = function arraySum(array) {
  return array.reduce((acc, val) => acc + val, 0);
};
