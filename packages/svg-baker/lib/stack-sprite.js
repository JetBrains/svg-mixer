const merge = require('merge-options');

const Sprite = require('./sprite');
const { generateSpriteTree, calculateSymbolPosition } = require('./utils');

class StackSprite extends Sprite {
  /**
   * @typedef {SpriteConfig} StackSpriteConfig
   * @property {string} usageClassName
   * @property {string} styles
   * @return {StackSpriteConfig}
   */
  static get defaultConfig() {
    return merge(super.defaultConfig, {
      usageClassName: 'sprite-symbol-usage',
      get styles() {
        return [
          `.${this.usageClassName} {display: none;}`,
          `.${this.usageClassName}:target {display: inline;}`
        ].join('\n');
      }
    });
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    const { symbols } = this;
    /** @type StackSpriteConfig */
    const config = this.config;

    return Promise.all(symbols.map(s => s.generate()))
      .then(symbolsTrees => {
        symbolsTrees.forEach(({ root }) => {
          root.tag = 'svg';
          root.attrs.class = config.usageClassName;
        });

        return generateSpriteTree({
          attrs: config.attrs,
          defs: [{
            tag: 'style',
            content: config.styles
          }],
          content: symbolsTrees
        });
      });
  }

  renderCss() {
    const { filename } = this.config;

    const css = this.symbols.map(s => {
      const { aspectRatio } = calculateSymbolPosition(s, this);
      return `
.${s.id}:before {
  display: block;
  padding-bottom: ${aspectRatio.toPercent()};
  background: url('${filename}#${s.id}') no-repeat;
  box-sizing: content-box;
  content: '';
}`;
    }).join('\n\n');

    return Promise.resolve(css);
  }
}

module.exports = StackSprite;
