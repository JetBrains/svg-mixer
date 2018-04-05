const postcss = require('postcss');
const merge = require('merge-options');
const { Compiler, Sprite, StackSprite } = require('svg-baker');

const { collectDeclarationsToProcess } = require('./utils');
const transforms = require('./transformations');

const defaultConfig = {
  keepAspectRatio: true
};

/**
 * TODO process only SVGs
 * TODO include, exclude
 * TODO format units percent or pixels
 */

const pluginName = 'postcss-svg-sprite';

module.exports = postcss.plugin(pluginName, opts => {
  const { keepAspectRatio, sprite: userSprite, ...compilerOpts } = merge(defaultConfig, opts);
  const hasUserSprite = userSprite && userSprite instanceof Sprite;
  const compiler = !hasUserSprite ? new Compiler(compilerOpts) : null;

  return async function plugin(root, result) {
    const declsAndPaths = await collectDeclarationsToProcess(root);
    let sprite;

    if (userSprite) {
      sprite = userSprite;
    } else {
      await compiler.add(declsAndPaths.map(item => item.path));
      sprite = await compiler.compile();
    }

    const spriteFilename = sprite.config.filename;

    declsAndPaths.forEach(({ decl, path }) => {
      const rule = decl.parent;
      const symbol = sprite.symbols.find(s => s.image.path === path);
      const position = sprite.calculateSymbolPosition(symbol, 'percent');

      if (keepAspectRatio) {
        transforms.aspectRatio(rule, position.aspectRatio);
      }

      if (sprite instanceof StackSprite) {
        transforms.stackSpriteSymbol(decl, `${spriteFilename}#${symbol.id}`);
      } else if (sprite instanceof Sprite) {
        transforms.spriteSymbol(decl, spriteFilename, position);
      }
    });

    const content = await sprite.render();

    result.messages.push({
      type: 'asset',
      kind: 'sprite',
      plugin: pluginName,
      file: spriteFilename,
      content,
      sprite
    });
  };
});

module.exports.name = pluginName;
