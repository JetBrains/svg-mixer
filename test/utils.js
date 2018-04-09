const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);

const processor = require('postsvg');

module.exports.testPlugin = (plugin = null) => async (options, input) => {
  const args = plugin ? [plugin(options !== null ? options : undefined)] : tree => tree;
  const res = await processor(args).process(input);
  return res.toString();
};

module.exports.readFixture = async filepath => readFile(__dirname, `fixtures/${filepath}`);
