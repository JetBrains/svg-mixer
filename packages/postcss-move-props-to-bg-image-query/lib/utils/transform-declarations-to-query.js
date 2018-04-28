/* eslint-disable arrow-body-style */
const merge = require('merge-options');

/**
 * @param {Array<postcss.Declaration>} decls
 * @param {function(decl: postcss.Declaration): {name: string, value: string}} transformer
 * @return {Object}
 */
module.exports = (decls, transformer) => {
  return decls.reduce((acc, decl) => {
    const { name, value } = transformer({
      name: decl.prop,
      value: decl.value
    });
    // eslint-disable-next-line no-param-reassign
    acc = merge(acc, { [name]: encodeURIComponent(value) });
    return acc;
  }, {});
}
