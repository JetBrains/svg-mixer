const { interpolateName } = require('loader-utils');

const { TOKENS } = require('../config');

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
    this._symbols = new Map();
  }

  /**
   * @return {SpriteSymbol[]}
   */
  get symbols() {
    return Array.from(this._symbols.values());
  }

  /**
   * @param {SpriteSymbol} symbol
   */
  addSymbol(symbol) {
    this._symbols.set(symbol.key, symbol);
  }

  /**
   * @return {Replacement[]}
   */
  getReplacements() {
    return this.symbols
      .map(s => s.replacements)
      .reduce((acc, r) => acc.concat(r), []);
  }

  compareEntryModules(left, right) {
    const leftRequest = left.request.split('!');
    const rightRequest = right.request.split('!');

    if (
      leftRequest[0].includes('extract-text-webpack-plugin') ||
      leftRequest[0].includes('mini-css-extract-plugin')
    ) {
      leftRequest.splice(0, 1);
    }

    if (
      rightRequest[0].includes('extract-text-webpack-plugin') ||
      rightRequest[0].includes('mini-css-extract-plugin')
    ) {
      rightRequest.splice(0, 1);
    }

    return leftRequest.join('!') === rightRequest.join('!');
  }

  /**
   * @param {SpriteSymbol} symbol
   * @param {Compilation} compilation
   * @return {Chunk[]}
   */
  findSymbolChunks(symbol, compilation) {
    const { module } = symbol;

    const symbolChunks = module.getChunks().length === 0
      ? module.issuer.getChunks()
      : module.getChunks();

    const symbolEntries = symbolChunks.map(c => c.entryModule);
    const entries = compilation.chunks.map(c => c.entryModule);

    const result = symbolEntries.reduce((acc, symbolEntry) => {
      const chunks = entries
        .filter(entry => this.compareEntryModules(symbolEntry, entry))
        .map(entry => entry.getChunks()[0]);

      return acc.concat(chunks);
    }, []);

    return result;
  }

  addIfNotExists(sprites, filename, symbol) {
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
  }

  /**
   * TODO simplify
   * @return {Promise<Array<{filename?: string, symbols: SpriteSymbol[]}>>}
   */
  groupBySpriteFileName(compilation) {
    const sprites = [];
    const filenames = {};
    const leadingSlashRegex = /^\//;
    const fileExtensionRegex = /\..*$/;
    const compilationContext = helpers.getRootCompilation(compilation)
      .compiler.context;

    this.symbols.forEach(symbol => {
      const { config, module } = symbol;

      const issuerRelPath = module.issuer.resource
        .replace(compilationContext, '')
        .replace(leadingSlashRegex, '');

      let filename = typeof config.filename === 'function'
        ? config.filename(module, issuerRelPath)
        : config.filename;

      const hasCompilationHashToken = filename.match(TOKENS.COMPILATION_HASH);
      const hasChunkNameToken = filename.match(TOKENS.CHUNK_NAME);
      const hasChunkHashToken = filename.match(TOKENS.CHUNK_HASH);

      if (hasCompilationHashToken) {
        filename = filename.replace(TOKENS.COMPILATION_HASH, compilation.hash);
      }

      if (hasChunkNameToken || hasChunkHashToken) {
        this.findSymbolChunks(symbol, compilation).forEach(chunk => {
          const cssFile = chunk.files.find(f => f.endsWith('.css'));
          const withoutExt = (cssFile ? cssFile : chunk.files[0])
            .replace(fileExtensionRegex, '');

          const chunkName = filename
            .replace(TOKENS.CHUNK_NAME, withoutExt)
            .replace(TOKENS.CHUNK_HASH, chunk.renderedHash);

          this.addIfNotExists(sprites, chunkName, symbol);
        });
      } else {
        this.addIfNotExists(sprites, filename, symbol);
      }
    });

    // const uniqueSymbolsPromises = Object.keys(filenames).map(filename => {
    //   const symbols = filenames[filename];
    //   const uniqueSymbolsMap = new Map();
    //
    //   const promises = symbols.map(s => s.render().then(content => {
    //     uniqueSymbolsMap.set(content, s);
    //   }));
    //
    //   return Promise.all(promises).then(() => {
    //     filenames[filename] = Array.from(uniqueSymbolsMap.values());
    //   });
    // });
    // return Promise.all(uniqueSymbolsPromises).then(() => filenames);

    return sprites;
  }

  /**
   * @param {Compilation} compilation
   * @return {Promise<CompiledSprite[]>}
   */
  async compile(compilation) {
    const { spriteClass, spriteConfig } = this.config;

    const sprites = this.groupBySpriteFileName(compilation);
    const result = [];

    for (const { symbols, filename } of sprites) {
      // eslint-disable-next-line new-cap
      const sprite = new spriteClass(spriteConfig, symbols);

      const content = await sprite.render();

      const r = { sprite, content };
      let resultFileName = filename;

      if (filename.match(TOKENS.SPRITE_HASH)) {
        resultFileName = interpolateName(
          process.cwd(),
          filename.replace('[contenthash', '[hash'),
          { content }
        );
      }

      r.filename = resultFileName;

      sprite.filename = resultFileName;
      sprite.symbols.forEach(symbol => {
        const { config, request: symbolUrl } = symbol;
        const position = sprite.calculateSymbolPosition(symbol, 'percent');

        symbol.replacements = [
          generator.symbolUrl(symbol, {
            filename: r.filename,
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

      result.push(new CompiledSprite(r));
    }

    return result;

    const resultPromises = sprites.map(spriteData => {
      const { symbols, filename } = spriteData;

      // eslint-disable-next-line new-cap
      const sprite = new spriteClass(spriteConfig, symbols);

      // eslint-disable-next-line consistent-return
      return sprite.render()
        .then(content => {
          const result = { sprite, content };
          let resultFileName = filename;

          if (filename.match(TOKENS.SPRITE_HASH)) {
            resultFileName = interpolateName(
              process.cwd(),
              filename.replace('[contenthash', '[hash'),
              { content }
            );
          }

          result.filename = resultFileName;

          sprite.filename = resultFileName;
          sprite.symbols.forEach(symbol => {
            const { config, request: symbolUrl } = symbol;
            const position = sprite.calculateSymbolPosition(symbol, 'percent');

            const r = generator.symbolUrl(symbol, {
              filename: result.filename,
              emit: config.emit,
              spriteType: config.spriteType
            });

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

    return Promise.all(resultPromises);
  }
};
