/* eslint-disable func-names */
const { parse: parseQuery } = require('query-string');

module.exports = function () {};

module.exports.pitch = function () {
  const q = parseQuery(this.resourceQuery.split('?')[1]);
  const result = `module.exports = ${JSON.stringify(q.spriteFilename)}`;
  return result;
};
