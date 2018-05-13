const { interpolateName } = require('loader-utils');

const { NO_SPRITE_FILENAME } = require('./config');
const generator = require('./utils/replacement-generator');

module.exports = class SpriteCompiler extends Map {
  /**
   * @return {Object<string, SpriteSymbol[]>}
   */
  groupBySpriteFileName() {
    return Array.from(this.keys()).reduce((acc, path) => {
      const symbol = this.get(path);
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

  compile({ spriteClass, spriteConfig }) {
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
