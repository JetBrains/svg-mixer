const createParser = require('posthtml-parser');

/**
 * @see https://github.com/fb55/htmlparser2/wiki/Parser-options
 */
const xmlParser = createParser({
  xmlMode: true,
  lowerCaseTags: false,
  decodeEntities: false,
  lowerCaseAttributeNames: false
});

module.exports = xmlParser;