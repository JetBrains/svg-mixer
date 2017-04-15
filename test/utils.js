const processor = require('posthtml-svg-mode');
const { strictEqual } = require('assert');

exports.setupPluginTest = (plugin = null) => {
  return (options, input, expected) => {
    const args = plugin ? [plugin(options !== null ? options : undefined)] : tree => tree;

    return processor(args)
      .process(input)
      .then(result => strictEqual(result.toString(), expected));
  };
};
