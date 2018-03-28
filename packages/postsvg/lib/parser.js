const createParser = require('posthtml-parser');

const Tree = require('./tree');

/**
 * @see https://github.com/fb55/htmlparser2/wiki/Parser-options
 */
const xmlParser = createParser({
  xmlMode: true,
  lowerCaseTags: false,
  decodeEntities: false,
  lowerCaseAttributeNames: false
});

module.exports = function parser(input, opts) {
  const tree = xmlParser(input, opts);
  return Tree.createFromArray(tree);
};
