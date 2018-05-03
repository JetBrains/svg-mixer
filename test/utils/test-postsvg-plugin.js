const postsvg = require('postsvg');
const prettify = require('pretty');

module.exports = (plugin = null) => async (options, input, processOpts) => {
  const args = plugin ? [plugin(options !== null ? options : undefined)] : tree => tree;
  const res = await postsvg(args).process(input, processOpts);
  return prettify(res.toString());
};
