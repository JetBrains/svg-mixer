const postcss = require('postcss');
const merge = require('merge-options');
const { Compiler, Sprite, StackSprite } = require('svg-mixer');
const { parse: parseQuery, stringify: stringifyQuery } = require('query-string');
const { createMatcher } = require('svg-mixer-utils');

const { name: packageName } = require('../package.json');

const collectDeclarations = require('./find-declarations-to-process');
const transform = require('./transform-declaration');

function convertToCompilerOpts(opts) {
  const { spriteFilename, ...rest } = opts;
  return {
    spriteConfig: {
      filename: spriteFilename
    },
    ...rest
  };
}

/**
 * @typedef {Object} PluginConfig
 * @extends {CompilerConfig}
 * @property {string} spriteType
 * @property {string} spriteFilename
 * @property {RegExp|string|Array<RegExp|string>} match
 * @property {boolean} selector=null
 * @property {Sprite|StackSprite} userSprite
 */
const defaultConfig = {
  spriteType: Sprite.TYPE,
  spriteFilename: Sprite.defaultConfig.filename,
  match: /\.svg($|\?.*$)/,
  selector: null,
  userSprite: null
};

module.exports = postcss.plugin(packageName, opts => {
  const { ctx, ...restOpts } = opts || {};
  const cfg = merge(defaultConfig, restOpts);
  const { userSprite, spriteType } = cfg;
  const compiler = !userSprite ? new Compiler(convertToCompilerOpts(cfg)) : null;
  const matcher = createMatcher(cfg.match);
  const isWebpack = !!(ctx && ctx.webpack && ctx.webpack.emitFile);

  return async function plugin(root, result) {
    const declsAndPaths = await collectDeclarations(root, matcher);
    if (!declsAndPaths.length) {
      return;
    }

    let sprite;
    let spriteContent;
    let spriteFilename;

    if (userSprite) {
      sprite = userSprite;
      spriteContent = await sprite.render();
      spriteFilename = sprite.config.filename;
    } else {
      for (const item of declsAndPaths) {
        const file = `${item.absolute}${item.query || ''}`;
        await compiler.addSymbolFromFile(file);
      }
      const res = await compiler.compile();
      sprite = res.sprite;
      spriteContent = res.content;
      spriteFilename = res.filename;
    }

    declsAndPaths.forEach(item => {
      const { decl, path, absolute, query } = item;

      const symbol = sprite.symbols.find(({ image }) => {
        return image.path === absolute && image.query === query;
      });

      if (!symbol) {
        return;
      }

      const position = sprite.calculateSymbolPosition(symbol, 'percent');
      const parsedQuery = parseQuery(query || '');
      let spriteUrl;

      if (spriteType === Sprite.TYPE) {
        // In webpack environment plugin produce `original_url?sprite_filename.svg`, and special loader
        // in pitching phase replace original url with sprite file name
        const q = stringifyQuery({ ...parsedQuery, spriteFilename });
        spriteUrl = isWebpack ? `${path}?${q}` : spriteFilename;
      } else if (spriteType === StackSprite.TYPE) {
        spriteUrl = `${spriteFilename}#${symbol.id}`;
      }

      transform({
        decl,
        selector: cfg.selector,
        position,
        spriteUrl,
        spriteType
      });
    });

    result.messages.push({
      type: 'asset',
      kind: 'sprite',
      plugin: packageName,
      file: result.opts.from,
      sprite,
      filename: spriteFilename,
      content: spriteContent
    });

    // Emit sprite file in webpack compilation assets
    if (isWebpack) {
      ctx.webpack.emitFile(spriteFilename, spriteContent);
    }
  };
});
