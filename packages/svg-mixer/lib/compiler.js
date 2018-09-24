/* eslint-disable new-cap */
const Path = require('path');
const { promisify } = require('util');

const merge = require('merge-options');
const glob = promisify(require('glob-all'));
const slugify = require('url-slug');
const { readFile } = require('fs-extra');
const { validate } = require('svg-mixer-utils');

const CompilerResult = require('./compiler-result');
const Image = require('./image');
const Sprite = require('./sprite');
const StackSprite = require('./stack-sprite');
const SpriteSymbol = require('./sprite-symbol');
const SymbolsMap = require('./sprite-symbols-map');

class Compiler {
  /**
   * @typedef {Object} CompilerConfig
   * @property {boolean} prettify=false
   * @property {string} spriteType 'classic' | 'stack'
   * @property {SpriteConfig|StackSpriteConfig} spriteConfig
   * @property {Sprite|StackSprite} spriteClass
   * @property {SpriteSymbol} symbolClass
   * @property {function(path: string, query: string)} generateSymbolId
   */
  static get defaultConfig() {
    return {
      prettify: false,
      spriteConfig: {},
      spriteType: Sprite.TYPE,
      spriteClass: Sprite,
      symbolClass: SpriteSymbol,
      generateSymbolId: (path, query = '') => {
        const basename = Path.basename(path, Path.extname(path));
        const decodedQuery = decodeURIComponent(decodeURIComponent(query));
        return slugify(`${basename}${decodedQuery}`);
      }
    };
  }

  /**
   * @param {CompilerConfig} cfg
   * @return {Compiler}
   */
  static create(cfg) {
    return new Compiler(cfg);
  }

  /**
   * @param {CompilerConfig} [config]
   */
  constructor(config = {}) {
    /** @type CompilerConfig */
    const cfg = merge(this.constructor.defaultConfig, config);

    if (!config.spriteClass) {
      switch (cfg.spriteType) {
        default:
        case Sprite.TYPE:
          cfg.spriteClass = Sprite;
          break;

        case StackSprite.TYPE:
          cfg.spriteClass = StackSprite;
          break;
      }
    }

    const errors = validate(require('../schemas/compiler'), cfg);

    if (errors.length) {
      throw new Error(errors.join('\n - '));
    }

    this.config = cfg;
    this._symbols = new SymbolsMap();
  }

  /**
   * @return {Array<SpriteSymbol>}
   */
  get symbols() {
    return this._symbols.toArray();
  }

  /**
   *
   * @param {SpriteSymbol} symbol
   */
  addSymbol(symbol) {
    this._symbols.add(symbol);
  }

  /**
   * @param {string} path Path may contain query string, eg. image.svg?param=value.
   * @return {Promise}
   */
  addSymbolFromFile(path) {
    return readFile(path.split('?')[0]).then(content => {
      const symbol = this.createSymbol({ path, content });
      this.addSymbol(symbol);
    });
  }

  /**
   * @param {Object} opts
   * @param {string} opts.path
   * @param {string|PostSvgTree} opts.content
   * @param {string} [opts.id]
   * @return {SpriteSymbol}
   */
  createSymbol({ path, content, id }) {
    let symbolId = id;
    if (!id) {
      const pathname = path.split('?')[0];
      const query = path.indexOf('?') > -1 ? path.substr(path.lastIndexOf('?')) : '';
      symbolId = this.config.generateSymbolId(pathname, query);
    }
    const img = new Image(path, content);
    return new this.config.symbolClass(symbolId, img);
  }

  /**
   * @return {Promise<CompilerResult>}
   */
  compile() {
    const { spriteClass, spriteConfig, prettify } = this.config;
    const sprite = new spriteClass(spriteConfig, this.symbols);
    return sprite.render(prettify).then(content => new CompilerResult(content, sprite));
  }

  /**
   * @param {string|Array<string>} pattern
   * @return {Promise}
   */
  glob(pattern) {
    return glob(pattern, { nodir: true, absolute: true })
      .then(paths => Promise.all(
        paths.map(path => this.addSymbolFromFile(path)))
      );
  }
}

module.exports = Compiler;
