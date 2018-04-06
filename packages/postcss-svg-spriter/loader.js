/* eslint-disable func-names */
module.exports = function () {};

module.exports.pitch = function () {
  const p = this.resourceQuery.split('?')[1];
  return `module.exports = ${JSON.stringify(p)}`;
};
