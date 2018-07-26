const { interpolateName } = require('loader-utils');

const generator = require('./utils/replacement-generator');

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
   * @return {Array<{filename?: string, symbols: SpriteSymbol[]}>}
   */
  groupBySpriteFileName() {
    const sprites = [];

    Array.from(this.symbols.keys()).forEach(path => {
      const symbol = this.symbols.get(path);
      const { config, image } = symbol;

      let filename;
      if (config.filename && config.emit) {
        filename = typeof config.filename === 'function'
          ? config.filename(image.path, image.query)
          : config.filename;
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

    const promises = this.groupBySpriteFileName().map(spriteData => {
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
            const { config, request } = symbol;
            const position = sprite.calculateSymbolPosition(symbol, 'percent');

            const replacements = [
              generator.symbolUrl(symbol, {
                filename: result.filename,
                emit: config.emit,
                spriteType: config.spriteType
              }),

              generator.bgPosLeft(request, position),

              generator.bgPosTop(request, position),

              generator.bgSizeWidth(request, position),

              generator.bgSizeHeight(request, position),

              config.publicPath && generator.publicPath(
                config.publicPath,
                compilation.getPath(config.publicPath)
              )
            ].filter(Boolean);

            symbol.replacements = replacements.reduce((acc, replacement) => {
              acc[replacement.value] = replacement.replaceTo;
              return acc;
            }, {});
          });

          return new CompiledSprite(result);
        });
    });

    return Promise.all(promises);
  }
};
