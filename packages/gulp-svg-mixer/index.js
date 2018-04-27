/* eslint-disable func-names */
const { resolve, dirname } = require('path');

const merge = require('merge-options');
const through2 = require('through2');
const File = require('vinyl');
const { Compiler, Sprite } = require('svg-mixer');
const postcss = require('postcss');
const postcssSprite = require('postcss-svg-mixer');
const postcssAspectRatio = require('postcss-aspect-ratio-from-bg-image');
const postcssPrettify = require('postcss-prettify');

/**
 * @param {SpriteSymbol[]} symbols
 * @param {string} selector
 * @return {string}
 */
function generateCss(symbols, selector) {
  return symbols
    .map(({ id, image }) => {
      const symbolSelector = selector.replace(/\[symbol-id\]/, id);
      return `${symbolSelector} {background: url('${image.path}${image.query}')}`;
    })
    .join('');
}

const defaultConfig = {
  prettify: true,
  sprite: {
    type: Sprite.TYPE,
    filename: Sprite.defaultConfig.filename
  },
  css: {
    filename: 'sprite-styles.css',
    selector: '.[symbol-id]',
    aspectRatio: true
  }
};

module.exports = config => {
  const cwd = process.cwd();
  const cfg = merge(defaultConfig, config);
  const {
    prettify,
    sprite: spriteConfig,
    css: cssConfig
  } = cfg;

  const compiler = Compiler.create({
    prettify,
    spriteType: spriteConfig.type,
    spriteConfig: {
      filename: spriteConfig.filename
    }
  });

  return through2.obj((file, enc, callback) => {
    compiler.addSymbol(
      compiler.createSymbol({ path: file.path, content: file.contents })
    );
    callback();
  }, async /** @this Stream */ function (callback) {
    const res = await compiler.compile();
    const spritePath = resolve(cwd, res.filename);

    this.push(new File({
      path: spritePath,
      base: dirname(spritePath),
      contents: new Buffer(res.content)
    }));

    if (cssConfig) {
      const cssPath = resolve(cwd, cssConfig.filename);

      const processor = postcss([
        cssConfig.aspectRatio && postcssAspectRatio(),
        postcssSprite({ userSprite: res.sprite }),
        prettify && postcssPrettify()
      ].filter(Boolean));

      const cssResult = await processor.process(
        generateCss(res.sprite.symbols, cssConfig.selector),
        { from: cssPath }
      );

      this.push(new File({
        path: cssPath,
        base: dirname(cssPath),
        contents: new Buffer(cssResult.css)
      }));
    }

    callback();
  });
};
