const { resolve } = require('path');

const { write } = require('fs-extra');
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
   * @param {string} dir Target folder
   * @param {string} [filename]
   * @return {Promise}
   */
  write(dir, filename = this.filename) {
    return write(resolve(dir, filename), this.content);
  }
}

module.exports = CompilerResult;
