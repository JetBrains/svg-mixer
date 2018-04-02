/* eslint-disable arrow-body-style */
const glob = require('glob');

module.exports = function promisifiedGlob(pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, { nodir: true, absolute: true }, (err, files) => {
      return err ? reject(err) : resolve(files);
    });
  });
};
