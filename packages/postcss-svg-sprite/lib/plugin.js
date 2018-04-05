const Promise = require('bluebird');
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

  return function plugin(root, result) {
    return collectDeclarationsToProcess(root)
      .then(data => Promise.props({
        data,
        sprite: userSprite || compiler
          .add(data.map(item => item.path))
          .then(() => compiler.compile())
      }))
      .then(({ data, sprite }) => {
        const spriteFilename = sprite.config.filename;

        data.forEach(({ decl, path }) => {
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

        return sprite.render().then(content => result.messages.push({
          type: 'asset',
          kind: 'sprite',
          plugin: pluginName,
          file: spriteFilename,
          content,
          sprite
        }));
      });
  };
});

module.exports.name = pluginName;
