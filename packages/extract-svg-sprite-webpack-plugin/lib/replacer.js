const escapeRegExpSpecialChars = require('escape-string-regexp');
const replace = require('replace-string');

module.exports = class Replacer {
  /**
   * @param {string} content
   * @param {Object<string, string>} replacements
   * @return {string}
   */
  static replace(content, replacements) {
    let result = content;

    Object.keys(replacements).forEach(key => {
      // const re = new RegExp(escapeRegExpSpecialChars(key), 'g');
      // result = result.replace(re, replacements[key]);
      result = replace(result, key, replacements[key]);
    });

    return result;
  }

  /**
   * @param {NormalModule|ExtractedModule} module
   * @param {Object<string, string>} replacements
   * @return {NormalModule|ExtractedModule}
   */
  static replaceInModuleSource(module, replacements) {
    const source = module._source;

    if (typeof source === 'string') {
      module._source = Replacer.replace(source, replacements);
    } else if (typeof source === 'object' && typeof source._value === 'string') {
      source._value = Replacer.replace(source._value, replacements);
    }

    return module;
  }
};
