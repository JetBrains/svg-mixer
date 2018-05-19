const webpackVersion = require('webpack/package.json').version;

module.exports = class Replacer {
  /**
   * @param {string} input
   * @param {string} needle
   * @return {Array}
   */
  static getAllStringOccurrences(input, needle) {
    const indexes = [];
    let prevIndex = 0;

    // eslint-disable-next-line keyword-spacing,no-constant-condition
    while (true) {
      const startIndex = input.indexOf(needle, prevIndex);

      if (startIndex === -1) {
        break;
      }

      const endIndex = startIndex + needle.length;
      indexes.push([startIndex, endIndex]);
      prevIndex = endIndex;
    }

    return indexes;
  }

  static getModuleReplaceSource(module, compilation) {
    const cachedSource = webpackVersion >= '4.5.0'
      ? module.source(compilation.dependencyTemplates)
      : module.source();

    const source = typeof cachedSource.replace === 'function'
      ? cachedSource
      : cachedSource._source;

    return source;
  }

  /**
   * @param {NormalModule} module
   * @param {Object<string, string>} replacements
   * @param {Compilation} compilation
   * @return {void}
   */
  static replaceInModuleSource(module, replacements, compilation) {
    const replaceSource = Replacer.getModuleReplaceSource(module, compilation);
    const originalSourceContent = module.originalSource().source();

    Object.keys(replacements).forEach(key => {
      const indexes = Replacer.getAllStringOccurrences(originalSourceContent, key);
      indexes.forEach(([start, end]) => {
        replaceSource.replace(start, end - 1, replacements[key]);
      });
    });
  }
};
