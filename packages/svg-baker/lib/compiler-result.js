const { resolve } = require('path');

const { outputFile } = require('fs-extra');

const interpolateName = require('./utils/interpolate-name');

class CompilerResult {
  /**
   * @param {string} content
   * @param {Sprite} sprite
   */
  constructor(content, sprite) {
    this.content = content;
    this.sprite = sprite;
  }

  /**
   * @return {string}
   */
  get filename() {
    return interpolateName(this.sprite.config.filename, this.content);
  }

  /**
   * @param {string} path
   * @return {Promise}
   */
  write(path) {
    return outputFile(resolve(path), this.content);
  }
}

module.exports = CompilerResult;
