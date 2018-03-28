const parse = require('./lib/parser');
const Processor = require('./lib/processor');
const render = require('./lib/renderer');
const Result = require('./lib/result');
const Tree = require('./lib/tree');

module.exports = function postsvg(plugins) {
  return new Processor(plugins);
};

module.exports.parse = parse;
module.exports.Processor = Processor;
module.exports.render = render;
module.exports.Result = Result;
module.exports.Tree = Tree;
