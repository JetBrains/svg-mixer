/* eslint-disable new-cap */
const Promise = require('bluebird');
const merge = require('merge-options');
const glob = require('glob-all');
const slugify = require('url-slug');
const { readFile } = require('fs-extra');

const Image = require('./image');
const Sprite = require('./sprite');
const StackSprite = require('./stack-sprite');
const SpriteSymbol = require('./sprite-symbol');
const { getBasename } = require('./utils');

class Compiler {
  /**
   * @typedef {Object} CompilerConfig
   * @property {string} spriteType 'classic' | 'stack'
   * @property {SpriteConfig|StackSpriteConfig} spriteConfig
   * @property {Sprite|StackSprite} spriteClass
   * @property {SpriteSymbol} symbolClass
   * @property {function(path: string)} generateSymbolId
   */
  static get defaultConfig() {
    return {
      spriteType: 'classic',
      spriteConfig: {},
      spriteClass: Sprite,
      symbolClass: SpriteSymbol,
      generateSymbolId: (path, query = '') => slugify(`${getBasename(path)}${query}`)
    };
  }

  /**
   * @param {CompilerConfig} config
   * @return {Compiler}
   */
  static create(config) {
    return new Compiler(config);
  }

  /**
   * @param {CompilerConfig} [config]
   */
  constructor(config = {}) {
    this.symbols = [];

    const cfg = merge(this.constructor.defaultConfig, config);
    switch (cfg.spriteType) {
      default:
      case 'classic':
        cfg.spriteClass = Sprite;
        break;

      case 'stack':
        cfg.spriteClass = StackSprite;
        break;
    }

    /** @type CompilerConfig */
    this.config = cfg;
  }

  /**
   * @param {string|Array<string>} files Glob pattern or absolute path or array of them
   * @return {Promise<SpriteSymbol>}
   */
  glob(files) {
    const p = typeof pattern === 'string' ? [files] : files;
    return new Promise((resolve, reject) => {
      glob(p, { nodir: true, absolute: true }, (err, f) => {
        return err ? reject(err) : resolve(f);
      });
    }).then(paths => this.addFiles(paths));
  }

  /**
   * @param {Array<string>} paths
   * @return {Promise<SpriteSymbol>}
   */
  addFiles(paths) {
    const { symbolClass, generateSymbolId: generateId } = this.config;
    const p = paths.map(path => ({
      path,
      absolute: path.split('?')[0]
    }));

    // eslint-disable-next-line arrow-body-style
    return Promise.map(p, ({ path, absolute }) => {
      return readFile(absolute).then(content => new Image(path, content));
    })
      .then(images => images.map(img => new symbolClass(generateId(img.path, img.query), img)))
      .then(symbols => {
        this.symbols = this.symbols.concat(symbols);
        return symbols;
      });
  }

  /**
   * @returns {Promise<Sprite>}
   */
  compile() {
    const { spriteClass, spriteConfig } = this.config;
    const sprite = new spriteClass(spriteConfig, this.symbols);
    return Promise.resolve(sprite);
  }
}

module.exports = Compiler;
