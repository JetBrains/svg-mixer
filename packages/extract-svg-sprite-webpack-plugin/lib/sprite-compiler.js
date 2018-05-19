const { interpolateName } = require('loader-utils');

const { NO_SPRITE_FILENAME } = require('./config');
const generator = require('./utils/replacement-generator');

module.exports = class SpriteCompiler {
  constructor(config) {
    this.config = config;
    this.symbols = new Map();
  }

  addSymbol(symbol) {
    const request = symbol.image.path + symbol.image.query;
    this.symbols.set(request, symbol);
  }

  /**
   * @return {Object<string, SpriteSymbol[]>}
   */
  groupBySpriteFileName() {
    return Array.from(this.symbols.keys()).reduce((acc, path) => {
      const symbol = this.symbols.get(path);
      const { options, image } = symbol;
      let filename;

      if (!options.filename || !options.emit) {
        filename = NO_SPRITE_FILENAME;
      } else {
        filename = typeof options.filename === 'function'
          ? options.filename(image.path, image.query)
          : options.filename;
      }

      if (!acc[filename]) {
        acc[filename] = [];
      }

      acc[filename].push(symbol);
      return acc;
    }, {});
  }

  compile() {
    const { spriteClass, spriteConfig } = this.config;
    const filenames = this.groupBySpriteFileName();

    const promises = Object.keys(filenames).map(name => {
      const symbols = filenames[name];
      // eslint-disable-next-line new-cap
      const sprite = new spriteClass(spriteConfig, symbols);

      return sprite.render()
        .then(content => ({
          sprite,
          symbols,
          content,
          filename: name.includes('[hash')
            ? interpolateName(process.cwd(), name, { content })
            : name
        }));
    });

    return Promise.all(promises).then(result => {
      result.forEach(data => {
        data.symbols.forEach(symbol => {
          symbol.replacements = generator.symbol({
            symbol,
            sprite: data.sprite,
            filename: data.filename
          });
        });
      });
      return result;
    });
  }
};
