/* eslint-disable arrow-body-style */
const glob = require('glob-all');

module.exports = function promisifiedGlob(pattern) {
  const p = typeof pattern === 'string' ? [pattern] : pattern;
  return new Promise((resolve, reject) => {
    glob(p, { nodir: true, absolute: true }, (err, files) => {
      return err ? reject(err) : resolve(files);
    });
  });
};
