const Path = require('path');

const { interpolateName } = require('loader-utils');

const generator = require('./replacement-generator');
const helpers = require('./helpers');

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
    this.symbols.set(symbol.request, symbol);
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

        if (filename.includes('[issuer-name]')) {
          filename = filename.replace(
            '[issuer-name]',
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
          const result = { sprite, content };

          if (filename) {
            result.filename = filename.includes('[hash')
              ? interpolateName(process.cwd(), filename, { content })
              : filename;
          }

          sprite.symbols.forEach(symbol => {
            const { config, request: symbolUrl } = symbol;
            const position = sprite.calculateSymbolPosition(symbol, 'percent');

            symbol.replacements = [
              generator.symbolUrl(symbol, {
                filename: result.filename,
                emit: config.emit,
                spriteType: config.spriteType
              }),

              generator.bgPosLeft(symbolUrl, position),

              generator.bgPosTop(symbolUrl, position),

              generator.bgSizeWidth(symbolUrl, position),

              generator.bgSizeHeight(symbolUrl, position),

              config.publicPath && new generator.Replacement(
                config.publicPath,
                compilation.getPath(config.publicPath)
              )
            ].filter(Boolean);
          });

          return new CompiledSprite(result);
        });
    });

    return Promise.all(promises);
  }
};
