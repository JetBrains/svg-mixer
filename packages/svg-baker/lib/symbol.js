const merge = require('merge-options');
const postsvg = require('postsvg');
const renameId = require('posthtml-rename-id');

const {
  svgToSymbol,
  normalizeViewBox,
  prefixStyleSelectors
} = require('./transformations');

class SpriteSymbol {
  constructor(id, image) {
    this.id = id;
    this.image = image;
  }

  /**
   * @param {SpriteSymbol} symbol
   * @param {Object} [attrs]
   * @return {{tag: string, attrs: Object}}
   */
  static createUsage(symbol, attrs = {}) {
    return {
      tag: 'use',
      attrs: merge({
        'xlink:href': `#${symbol.id}`
      }, attrs)
    };
  }

  get width() {
    return this.image.width;
  }

  get height() {
    return this.image.height;
  }

  get viewBox() {
    return this.image.viewBox;
  }

  /**
   * @param {Object} [attrs]
   * @return {{tag: string, attrs: Object}}
   */
  createUsage(attrs = {}) {
    return this.constructor.createUsage(this, attrs);
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    const { id } = this;

    return postsvg([
      normalizeViewBox(),
      prefixStyleSelectors(`#${id}`),
      renameId(`${id}_[id]`),
      svgToSymbol({ id })
    ])
      .process(this.image.tree, { skipParse: true })
      .then(res => res.tree);
  }

  /**
   * @return {Promise<string>}
   */
  render() {
    return this.generate().then(tree => tree.toString());
  }

}

module.exports = SpriteSymbol;
