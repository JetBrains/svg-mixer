const processor = require('posthtml-svg-mode');

exports.setupPluginTest = (plugin = null) => {
  return (options, input, expected) => {
    const args = plugin ? [plugin(options !== null ? options : undefined)] : tree => tree;

    return processor(args)
      .process(input)
      .then(result => expect(result.toString()).to.equal(expected));
  };
};
