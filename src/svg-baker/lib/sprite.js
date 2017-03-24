const { renderer } = require('../../posthtml-svg-mode');
const defaultFactory = require('./sprite-factory');

class Sprite {
  constructor({ tree, filename }) {
    this.tree = tree;
    this.filename = filename;
  }

  /**
   * @param {Object} options
   * @param {Array<SpriteSymbol>} options.symbols
   * @param {string} options.filename
   * @param {Function<Promise<PostHTMLProcessingResult>>} [options.factory]
   * @return {Promise<Sprite>}
   */
  static create(options) {
    const { filename, factory = defaultFactory } = options;
    return factory(options).then(({ tree }) => new this.constructor({ tree, filename }));
  }

  /**
   * @return {string}
   */
  render() {
    return renderer(this.tree);
  }
}

module.exports = Sprite;
