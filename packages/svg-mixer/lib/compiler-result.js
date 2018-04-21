const { resolve } = require('path');

const { outputFile } = require('fs-extra');

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
    return this.sprite.config.filename;
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
