const postcss = require('postcss');
const merge = require('merge-options');
const { Compiler, Sprite, StackSprite } = require('svg-baker');
const { stringify: stringifyQuery } = require('query-string');

const { name: packageName } = require('../package.json');

const { collectDeclarationsToProcess } = require('./utils');
const transforms = require('./transformations');

const defaultConfig = {
  keepAspectRatio: true
};

/**
 * TODO process only SVGs
 * TODO include, exclude
 * TODO format units percent or pixels
 * TODO 2 modes of :before and :after generation
 */

module.exports = postcss.plugin(packageName, opts => {
  const {
    ctx,
    keepAspectRatio,
    sprite: userSprite,
    ...compilerOpts
  } = merge(defaultConfig, opts);
  const compiler = !userSprite ? new Compiler(compilerOpts) : null;
  const isWebpack = !!(ctx && ctx.webpack);

  return async function plugin(root, result) {
    const declsAndPaths = await collectDeclarationsToProcess(root);
    let sprite;

    if (userSprite) {
      sprite = userSprite;
    } else {
      const files = declsAndPaths.map(item => item.path);
      await compiler.add(files);
      sprite = await compiler.compile();
    }

    const spriteFilename = sprite.config.filename;

    declsAndPaths.forEach(item => {
      const { decl, path, absolutePath, query = {} } = item;
      const rule = decl.parent;
      const symbol = sprite.symbols.find(s => s.image.path === absolutePath);
      const position = sprite.calculateSymbolPosition(symbol, 'percent');
      let url;

      if (keepAspectRatio) {
        transforms.aspectRatio(rule, position.aspectRatio);
      }

      if (sprite instanceof StackSprite) {
        url = `${spriteFilename}#${symbol.id}`;
        transforms.stackSpriteSymbol(decl, url);
      } else if (sprite instanceof Sprite) {
        // In webpack env plugin produce `original_url?sprite_filename.svg`, and special loader
        // in pitching phase replace original url with sprite file name
        const q = stringifyQuery({ ...query, spriteFilename });
        url = isWebpack ? `${path}?${q}` : spriteFilename;
        transforms.spriteSymbol(decl, url, position);
      }
    });

    const spriteContent = await sprite.render();

    result.messages.push({
      type: 'asset',
      plugin: packageName,
      file: spriteFilename,
      content: spriteContent,
      sprite
    });

    if (isWebpack) {
      ctx.webpack._compilation.assets[spriteFilename] = {
        source() {
          return spriteContent;
        },
        size() {
          return spriteContent.length;
        }
      };
    }
  };
});
