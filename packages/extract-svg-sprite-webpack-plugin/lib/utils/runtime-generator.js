const mixer = require('svg-mixer');

const generator = require('./replacement-generator');

const stringify = JSON.stringify;

class RuntimeGenerator {
  /**
   * @param {mixer.SpriteSymbol} symbol
   * @param {ExtractSvgSpritePluginConfig} config
   */
  constructor(symbol, config) {
    this.symbol = symbol;
    this.config = config;
    this.isClassicSprite = config.spriteType === mixer.Sprite.TYPE;
  }

  /**
   * @return {string}
   */
  publicPath() {
    return this.config.publicPath
      ? stringify(this.config.publicPath)
      : '__webpack_public_path__';
  }

  /**
   * @return {string}
   */
  id() {
    return stringify(this.symbol.id);
  }

  /**
   * Returns executable expression, not just a string, e.g:
   * __webpack_require__.p + "sprite.svg"
   *
   * Or with custom publicPath config option:
   * "/public-path/" + "sprite.svg"
   *
   * @return {string}
   */
  url() {
    const { symbol, config } = this;
    const symbolUrl = generator.symbolUrl(symbol, config).token;

    return config.filename && config.emit
      ? `${this.publicPath()} + ${stringify(symbolUrl)}`
      : `${stringify(symbolUrl)}`;
  }

  /**
   * @return {number}
   */
  width() {
    return this.symbol.width;
  }

  /**
   * @return {number}
   */
  height() {
    return this.symbol.height;
  }

  /**
   * @return {string}
   */
  viewBox() {
    return stringify(this.symbol.viewBox.join(' '));
  }

  /**
   * Will be null for stack sprite
   * @return {string|null}
   */
  backgroundPosition() {
    if (this.isClassicSprite) {
      return stringify([
        generator.bgPosLeft(this.symbol.request).token,
        generator.bgPosTop(this.symbol.request).token
      ].join(' '));
    }

    return null;
  }

  /**
   * Will be null for stack sprite
   * @return {string|null}
   */
  backgroundSize() {
    if (this.isClassicSprite) {
      return stringify([
        generator.bgSizeWidth(this.symbol.request).token,
        generator.bgSizeHeight(this.symbol.request).token
      ].join(' '));
    }

    return null;
  }

  /**
   * @return {string}
   */
  toString() {
    return `function () { return ${this.url()} }`;
  }

  /**
   * @param {Object<string, string>} fields
   * @return {string}
   */
  generateWrapper(fields) {
    const body = Object.keys(fields)
      .filter(field => !!fields[field])
      .map(field => `${field}: ${fields[field]}`)
      .join(',\n  ');

    return `module.exports = {\n  ${body}\n}`;
  }

  /**
   * @return {string}
   */
  generate() {
    return this.generateWrapper({
      id: this.id(),
      url: this.url(),
      width: this.width(),
      height: this.height(),
      viewBox: this.viewBox(),
      toString: this.toString(),
      backgroundSize: this.backgroundSize(),
      backgroundPosition: this.backgroundPosition()
    });
  }
}

module.exports = RuntimeGenerator;
