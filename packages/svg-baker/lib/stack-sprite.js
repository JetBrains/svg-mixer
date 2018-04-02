const merge = require('merge-options');

const Sprite = require('./sprite');
const { createSpriteTree, calculateSymbolPosition } = require('./utils');

class StackSprite extends Sprite {
  static get defaultConfig() {
    return merge(super.defaultConfig, {
      usageClassName: 'sprite-symbol-usage'
    });
  }

  /**
   * @param {string} id
   * @return {string}
   */
  generateSymbolId(id) {
    return this.config.usages ? `${id}_symbol` : id;
  }

  /**
   * @return {Promise<PostSvgTree>}
   */
  generate() {
    const { symbols, config } = this;

    let usages;
    if (config.usages) {
      usages = symbols.map(s => s.createUsage({
        id: s.id,
        'xlink:href': `#${this.generateSymbolId(s.id)}`,
        class: config.usageClassName
      }));
    }

    return Promise.all(symbols.map(s => s.generate()))
      .then(symbolsTrees => {
        if (config.usages) {
          symbolsTrees.forEach(({ root }) => root.attrs.id = this.generateSymbolId(root.attrs.id));
        }

        return createSpriteTree({
          attrs: config.attrs,
          symbols: symbolsTrees,
          usages
        });
      })
      .then(tree => {
        const { root } = tree;
        const defs = root.content.find(node => typeof node === 'object' && node.tag === 'defs');

        defs.content.push({
          tag: 'style',
          content: `
.${config.usageClassName} {display: none;}
.${config.usageClassName}:target {display: inline;}
`
        });

        return tree;
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
