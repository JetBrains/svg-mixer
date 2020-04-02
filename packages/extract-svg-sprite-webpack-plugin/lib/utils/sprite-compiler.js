const Path = require('path');

const { interpolateName } = require('loader-utils');

const generator = require('./replacement-generator');
const helpers = require('./helpers');

const MINI_EXTRACT_MODULE_TYPE = 'css/mini-extract';

class CompiledSprite {
  constructor({ sprite, content, filename }) {
    this.filename = filename;
    this.content = content;
    this.sprite = sprite;
  }
}

module.exports = class SpriteCompiler {
  constructor(config) {
    this.config = config;
    this.symbols = new Map();
  }

  /**
   * @param {mixer.SpriteSymbol} symbol
   */
  addSymbol(symbol) {
    this.symbols.set(symbol.key || symbol.request, symbol);
  }

  /**
   * @return {Replacement[]}
   */
  getReplacements() {
    return Array.from(this.symbols.values())
      .map(s => s.replacements)
      .reduce((acc, r) => acc.concat(r), []);
  }

  /**
   * @return {Array<{filename?: string, symbols: SpriteSymbol[]}>}
   */
  groupBySpriteFileName(compilation) {
    const sprites = [];

    Array.from(this.symbols.keys()).forEach(path => {
      const symbol = this.symbols.get(path);
      const { config, module } = symbol;

      const compilationContext = helpers.getRootCompilation(compilation)
        .compiler.context;

      let filename;
      if (config.filename && config.emit) {
        filename = typeof config.filename === 'function'
          ? config.filename(module)
          : config.filename;

        if (filename.includes('[issuer-path]')) {
          filename = filename.replace(
            '[issuer-path]',
            module.issuer.resource
              .replace(compilationContext, '')
              .replace(Path.extname(module.issuer.resource), '')
              .replace(/^\//, '')
          );
        }
      }

      let sprite = sprites.find(s => s.filename === filename);
      if (!sprite) {
        sprite = { symbols: [symbol] };
        if (filename) {
          sprite.filename = filename;
        }
        sprites.push(sprite);
      } else {
        sprite.symbols.push(symbol);
      }
    });

    return sprites;
  }

  /**
   * @param {Compilation} compilation
   * @return {Promise<CompiledSprite[]>}
   */
  compile(compilation) {
    const { spriteClass, spriteConfig } = this.config;

    const promises = this.groupBySpriteFileName(compilation).map(spriteData => {
      const { filename, symbols } = spriteData;

      // eslint-disable-next-line new-cap
      const sprite = new spriteClass(spriteConfig, symbols);

      return sprite.render()
        .then(content => {
          const result = { sprite, content, filename };

          if (filename && filename.includes('[contenthash')) {
            result.filename = interpolateName(
              process.cwd(),
              filename.replace('[contenthash', '[hash'),
              { content }
            );
          }

          sprite.symbols.forEach(symbol => {
            const { config, request: symbolUrl } = symbol;
            const position = sprite.calculateSymbolPosition(symbol, 'percent');

            symbol.cssModules = symbol.issuers
              .map(issuer => compilation.modules.find(m =>
                m.type === MINI_EXTRACT_MODULE_TYPE &&
                m.issuer.request.includes(issuer.request)))
              .filter(Boolean);

            symbol.replacements = [
              generator.symbolUrl(symbol, {
                ...config,
                filename: result.filename
              }),

              generator.bgPosLeft(symbolUrl, position),

              generator.bgPosTop(symbolUrl, position),

              generator.bgSizeWidth(symbolUrl, position),

              generator.bgSizeHeight(symbolUrl, position),

              config.publicPath && new generator.Replacement(
                config.publicPath,
                compilation.getPath(config.publicPath)
              )
            ].filter(replacement => replacement && replacement.replaceTo);
          });

          return new CompiledSprite(result);
        });
    });

    return Promise.all(promises);
  }
};
