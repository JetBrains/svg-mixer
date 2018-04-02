const Promise = require('bluebird');

const Compiler = require('./lib/compiler');
const Image = require('./lib/image');
const Sprite = require('./lib/sprite');
const StackSprite = require('./lib/stack-sprite');
const SpriteSymbol = require('./lib/symbol');

/**
 * @param {string} globPattern
 * @param {CompilerConfig} [config] {@see Compiler.defaultConfig}
 * @return {Promise<{sprite: Sprite, svg: string, css: string}>}
 */
module.exports = (globPattern, config = {}) => {
  switch (config.mode) {
    case 'default':
    default:
      config.spriteClass = Sprite;
      break;

    case 'stack':
      config.spriteClass = StackSprite;
      break;
  }

  const compiler = new Compiler(config);

  return compiler.addSymbolsFromFiles(globPattern)
    .then(() => compiler.compile())
    .then(sprite => Promise.props({
      sprite,
      svg: sprite.render(),
      css: sprite.renderCss()
    }));
};

module.exports.Compiler = Compiler;
module.exports.Image = Image;
module.exports.Sprite = Sprite;
module.exports.StackSprite = StackSprite;
module.exports.Symbol = SpriteSymbol;
