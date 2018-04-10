const postcss = require('postcss');
const merge = require('merge-options');
const { Compiler, Sprite, StackSprite } = require('svg-baker');
const { parse: parseQuery, stringify: stringifyQuery } = require('query-string');
const anymatch = require('anymatch');

const { name: packageName } = require('../package.json');

const { collectDeclarationsToProcess } = require('./utils');
const transforms = require('./transformations');

/**
 * @typedef {Object} PluginConfig
 * @extends {CompilerConfig}
 * @property {RegExp|string|Array<RegExp|string>} match
 * @property {string} format 'plain' | 'flexible'
 * @property {Sprite} sprite
 * @property {boolean} aspectRatio=true
 */
const defaultConfig = {
  match: /\.svg($|\?.*$)/,
  format: 'plain',
  aspectRatio: true,
  spriteType: 'classic',
  sprite: undefined
};

module.exports = postcss.plugin(packageName, opts => {
  const {
    ctx,
    match,
    format,
    aspectRatio,
    sprite: userSprite,
    ...compilerOpts
  } = merge(defaultConfig, opts);

  const compiler = !userSprite ? new Compiler(compilerOpts) : null;
  const fileMatcher = path => anymatch(match, path);
  const isWebpack = !!(ctx && ctx.webpack);

  return async function plugin(root, result) {
    const declsAndPaths = await collectDeclarationsToProcess(root, fileMatcher);
    let sprite;

    if (userSprite) {
      sprite = userSprite;
    } else {
      const files = declsAndPaths.map(item => `${item.absolute}${item.query || ''}`);
      await compiler.addFiles(files);
      sprite = await compiler.compile();
    }

    const spriteFilename = sprite.config.filename;

    declsAndPaths.forEach(item => {
      const { decl, path, absolute, query } = item;
      const rule = decl.parent;
      const symbol = sprite.symbols.find(({ image }) => {
        return image.path === absolute && image.query === query;
      });
      const position = sprite.calculateSymbolPosition(symbol, 'percent');
      const parsedQuery = parseQuery(query || '');
      let spriteUrl;

      if (sprite instanceof StackSprite) {
        spriteUrl = `${spriteFilename}#${symbol.id}`;
        transforms.stackSpriteSymbol(decl, spriteUrl);
      } else if (sprite instanceof Sprite) {
        // In webpack environment plugin produce `original_url?sprite_filename.svg`, and special loader
        // in pitching phase replace original url with sprite file name
        const q = stringifyQuery({ ...parsedQuery, spriteFilename });
        spriteUrl = isWebpack ? `${path}?${q}` : spriteFilename;

        transforms.spriteSymbol({
          decl,
          position,
          spriteUrl,
          format
        });
      }

      if (aspectRatio) {
        transforms.aspectRatio(rule, position.aspectRatio);
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
