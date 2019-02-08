const postcss = require('postcss');

const CUSTOM_PROPERTY_DECL_REGEXP = /^--[A-z][\w-]*$/;
const CUSTOM_PROPERTY_REGEXP = /(^|[^\w-])var\([\W\w]+\)/;

/**
 * @param {postcss.Declaration[]} decls
 * @param {function(decl: postcss.Declaration): {name: string, value: string}} transformer
 * @return {Object<string, string>}
 */
function declsToObject(decls, transformer) {
  return decls.reduce((acc, decl) => {
    const { name, value } = transformer({
      name: decl.prop,
      value: decl.value
    });
    // eslint-disable-next-line no-param-reassign
    acc = Object.assign(acc, {
      [name]: value
    });
    return acc;
  }, {});
}

module.exports.declsToObject = declsToObject;

/**
 * @param {postcss.Declaration[]} decls
 * @param {postcss.Root} tree
 * @param {postcss.PluginInitializer} computer
 * @return {Promise<postcss.Declaration[]>}
 */
async function computeCustomProps(decls, tree, computer, from) {
  const map = new Map();
  const clonedTree = tree.clone();

  clonedTree.walkDecls(clonedDecl => {
    const sourceDecl = decls.find(decl => (
      decl.source.start.column === clonedDecl.source.start.column &&
      decl.source.start.line === clonedDecl.source.start.line &&
      decl.source.end.column === clonedDecl.source.end.column &&
      decl.source.end.line === clonedDecl.source.end.line
    ));

    if (sourceDecl) {
      map.set(sourceDecl, clonedDecl);
    }
  });

  const { root } = await postcss()
    .use(computer)
    .process(clonedTree.toResult(), { from });

  for (const [decl, clonedDecl] of map.entries()) {
    decl.value = clonedDecl.value;
  }

  return decls;
}

module.exports.computeCustomProps = computeCustomProps;
