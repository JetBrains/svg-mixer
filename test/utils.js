const path = require('path');
const { readFileSync } = require('fs');

const postsvg = require('postsvg');
const prettify = require('pretty');

const fixturesDir = path.resolve(__dirname, 'fixtures');

module.exports.testPlugin = (plugin = null) =>
  async (options, input, processOpts) => {
    const args = plugin ? [plugin(options !== null ? options : undefined)] : tree => tree;
    const res = await postsvg(args).process(input, processOpts);
    return prettify(res.toString());
  };

module.exports.fixturesDir = fixturesDir;

module.exports.getFixture =
  filepath => readFileSync(path.resolve(fixturesDir, filepath)).toString();

module.exports.parse = input => postsvg.parse(input);
