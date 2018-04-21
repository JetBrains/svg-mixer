/* eslint-disable func-names */
const { resolve, dirname } = require('path');

const merge = require('merge-options');
const through2 = require('through2');
const File = require('vinyl');
const { Compiler } = require('svg-mixer');
const pretty = require('pretty');
const postcss = require('postcss');
const postcssSprite = require('postcss-svg-mixer');
const postcssPrettify = require('postcss-prettify');

const defaultConfig = {
  sprite: {
    filename: 'sprite.svg',
    prettify: true
  },
  css: {
    mode: 'plain',
    filename: 'sprite-styles.css',
    selector: '.img-[symbol-id]',
    prettify: true
  }
};

module.exports = config => {
  const cwd = process.cwd();
  const {
    sprite: spriteConfig,
    css: cssConfig,
    ...restConfig
  } = merge(defaultConfig, config);

  const compilerConfig = merge(restConfig, { spriteConfig });
  const compiler = Compiler.create(compilerConfig);

  return through2.obj((file, enc, callback) => {
    compiler.addSymbol(
      compiler.createSymbol({ path: file.path, content: file.contents })
    );
    callback();
  }, async /** @this Stream */ function (callback) {
    const {
      sprite,
      filename: spriteFilename,
      content: spriteContent
    } = await compiler.compile();
    const spritePath = resolve(cwd, spriteFilename);

    this.push(new File({
      path: spritePath,
      base: dirname(spritePath),
      contents: new Buffer(
        spriteConfig.prettify ? pretty(spriteContent) : spriteContent
      )
    }));

    if (cssConfig) {
      const cssPath = resolve(cwd, cssConfig.filename);
      const processor = postcss([
        postcssSprite(merge(cssConfig, { sprite })),
        cssConfig.prettify && postcssPrettify()
      ].filter(Boolean));

      const cssResult = await processor.process(
        generateCss(sprite.symbols, cssConfig.selector),
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
