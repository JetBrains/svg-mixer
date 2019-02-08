const Result = require('postcss/lib/result')

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
 * @param {postcss.Result} computer
 * @param {postcss.Processor} result
 * @return {Promise<postcss.Declaration[]>}
 */
async function computeCustomProps(decls, result, processor) {
  const map = new Map();
  const clonedRoot = result.root.clone();

  clonedRoot.walkDecls(clonedDecl => {
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

  // FIXME bad idea to use private API but this way prevents double parsing
  await processor.process(
    new Result(processor, clonedRoot),
    { from: result.opts.from }
  );

  for (const [decl, clonedDecl] of map.entries()) {
    decl.value = clonedDecl.value;
  }

  return decls;
}

module.exports.computeCustomProps = computeCustomProps;
