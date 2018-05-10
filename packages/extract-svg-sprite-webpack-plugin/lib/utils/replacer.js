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

  /**
   * @param {NormalModule} module
   * @param {Object<string, string>} replacements
   * @return {NormalModule}
   */
  static replaceInModuleSource(module, replacements) {
    const source = module.source();
    const content = module.originalSource().source();

    Object.keys(replacements).forEach(key => {
      const indexes = Replacer.getAllStringOccurrences(content, key);
      indexes.forEach(([start, end]) => {
        source.replace(start, end - 1, replacements[key]);
      });
    });

    return module;
  }
};
