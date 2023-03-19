const merge = require('merge-options');

const Sprite = require('./sprite');
const { generateSpriteTree } = require('./utils');

class StackSprite extends Sprite {
  /**
   * @typedef {SpriteConfig} StackSpriteConfig
   * @property {string} usageClassName
   * @property {string} styles
   * @return {StackSpriteConfig}
   */
  static get defaultConfig() {
    return merge(super.defaultConfig, {
      usageClassName: 'sprite-symbol-usage'
    });
  }

  static get TYPE() {
    return 'stack';
  }

  get styles() {
    const { usageClassName } = this.config;
    return `.${usageClassName} { display: none; } .${usageClassName}:target { display: inline; }`;
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
          defs: [
            {
              tag: 'style',
              content: this.styles
            }
          ],
          content: symbolsTrees
        });
      });
  }
}

module.exports = StackSprite;
