const Promise = require('bluebird');

const Compiler = require('./lib/compiler');
const Image = require('./lib/image');
const Sprite = require('./lib/sprite');
const SpriteValue = require('./lib/sprite-value');
const StackSprite = require('./lib/stack-sprite');
const SpriteSymbol = require('./lib/sprite-symbol');
const SpriteSymbolsMap = require('./lib/sprite-symbols-map');

/**
 * @param {string|Array<string>} files Glob pattern, absolute path or array of them combination.
 * @param {CompilerConfig} [config]
 * @return {Promise<{sprite: Sprite, svg: string}>}
 */
module.exports = (files, config = {}) => {
  const compiler = new Compiler(config);

  return compiler.add(files)
    .then(() => compiler.compile())
    .then(sprite => Promise.props({ sprite, content: sprite.render() }));
};

module.exports.Compiler = Compiler;
module.exports.Image = Image;
module.exports.Sprite = Sprite;
module.exports.SpriteValue = SpriteValue;
module.exports.StackSprite = StackSprite;
module.exports.SpriteSymbol = SpriteSymbol;
module.exports.SpriteSymbolsMap = SpriteSymbolsMap;
