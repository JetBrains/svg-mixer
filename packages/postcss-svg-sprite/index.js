const path = require('path');

const Promise = require('bluebird');
const postcss = require('postcss');
const { createUrlsHelper } = require('postcss-helpers');
const { Compiler, Symbol: SpriteSymbol } = require('svg-baker');
const createImageFromFile = require('svg-baker/lib/utils/create-image-from-file');
const calculatePos = require('svg-baker/lib/utils/calculate-symbol-position');

const { resolveFile, transformRule } = require('./utils');

const BACKGROUND_DECL_NAME_REGEXP = new RegExp('^background(-image)?$', 'i');
const URL_FUNCTION_REGEXP = new RegExp('url\\\(.*?\\\)', 'ig');

/**
 * TODO process only SVGs
 * TODO include, exclude
 *
 * TODO deal with sprite filename resolving??? Или не надо, т.к. запись файла спрайта происходит по месту
 *
 * TODO sprite прокидывается сверху, тогда плагин работает просто как генератор стилей и не добавляет никаких символов,
 *      т.к. предполагается что спрайт уже содержит нужные символы
 */

module.exports = postcss.plugin('postcss-svg-sprite', opts => {
  const compiler = new Compiler(opts);
  const { generateSymbolId, spriteClass, spriteConfig } = compiler.config;

  return function plugin(root) {
    const from = root.source.input.file;
    const stylesheetContext = from ? path.dirname(from) : undefined;
    const promises = [];

    const sprite = new spriteClass(spriteConfig);
    const spriteFilename = sprite.config.filename;

    root.walkDecls(decl => {
      const { parent: rule } = decl;

      // TODO refactor this shit to separate util
      const shouldBeProcessed =
        BACKGROUND_DECL_NAME_REGEXP.test(decl.prop) &&
        URL_FUNCTION_REGEXP.test(decl.value);

      BACKGROUND_DECL_NAME_REGEXP.lastIndex = 0;
      URL_FUNCTION_REGEXP.lastIndex = 0;

      if (!shouldBeProcessed) {
        return;
      }

      const helper = createUrlsHelper(decl.value);
      const url = helper.URIS[0];

      const promise = resolveFile(url.toString(), stylesheetContext)
        .then(filepath => createImageFromFile(filepath)
          .then(image => new SpriteSymbol(generateSymbolId(filepath), image))
        )
        .then(symbol => {
          sprite.addSymbol(symbol);
          decl.remove();
          return [rule, symbol];
        });

      promises.push(promise);
    });

    return Promise.all(promises)
      .then(results => {
        results.forEach(([rule, symbol]) => {
          transformRule(rule, calculatePos(symbol, sprite), spriteFilename);
        });
      })
      .then(() => sprite.render())
      .then(content => plugin.lastResult = content);
  };
});
