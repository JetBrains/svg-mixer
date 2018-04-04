/* eslint-disable new-cap */
const Promise = require('bluebird');
const merge = require('merge-options');

const Sprite = require('./sprite');
const StackSprite = require('./stack-sprite');
const SpriteSymbol = require('./symbol');
const { glob, createImageFromFile, getBasename } = require('./utils');

/**
 * @typedef {Object} CompilerConfig
 * @property {string} mode 'default' | 'stack'
 * @property {SpriteConfig|StackSpriteConfig} spriteConfig
 * @property {Sprite|StackSprite} spriteClass
 * @property {SpriteSymbol} symbolClass
 * @property {function(path: string)} generateSymbolId
 */
const defaultConfig = {
  mode: 'default',
  spriteConfig: {},
  spriteClass: Sprite,
  symbolClass: SpriteSymbol,
  generateSymbolId: path => getBasename(path)
};

/**
 * @param {string|Array<string>} files Glob pattern or array of absolute paths
 * @param {CompilerConfig} [config]
 * @return {Promise<{sprite: Sprite, svg: string, css: string}>}
 */
module.exports = (files, config = {}) => {
  const cfg = merge(defaultConfig, config);
  const {
    generateSymbolId: generateId,
    spriteClass,
    spriteConfig,
    symbolClass
  } = cfg;

  switch (cfg.mode) {
    default:
    case 'default':
      cfg.spriteClass = Sprite;
      break;

    case 'stack':
      cfg.spriteClass = StackSprite;
      break;
  }

  return glob(files)
    .then(paths => Promise.map(paths, path => createImageFromFile(path)))
    .then(images => images.map(img => new symbolClass(generateId(img.path), img)))
    .then(symbols => new spriteClass(spriteConfig, symbols))
    .then(sprite => Promise.props({
      sprite,
      svg: sprite.render(),
      css: sprite.renderCss()
    }));
};
