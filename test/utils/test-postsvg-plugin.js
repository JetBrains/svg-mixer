const postsvg = require('postsvg');
const pretty = require('pretty');

module.exports = (plugin = null, prettify = true) => async (options, input, processOpts) => {
  const args = plugin ? [plugin(options !== null ? options : undefined)] : tree => tree;
  const res = await postsvg(args).process(input, processOpts);
  return prettify ? pretty(res.toString()) : res.toString();
};
