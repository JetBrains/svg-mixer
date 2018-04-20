const { resolve, dirname } = require('path');

const { outputFile } = require('fs-extra');
const { interpolateName } = require('loader-utils');

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
    const configFilename = this.sprite.config.filename;

    return configFilename.includes('[hash')
      ? interpolateName({}, configFilename, { content: this.content })
      : configFilename;
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
