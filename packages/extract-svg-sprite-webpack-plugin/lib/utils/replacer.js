const webpackVersion = parseInt(require('webpack/package.json').version, 10);

const MINI_EXTRACT_MODULE_TYPE = 'css/mini-extract';

module.exports = class Replacer {
  /**
   * @param {string} input
   * @param {string} needle
   * @return {Array<number>[]}
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
   * @param {Compilation} compilation
   * @return {ReplaceSource}
   */
  static getModuleReplaceSource(module, compilation) {
    const args = [compilation.dependencyTemplates];

    // eslint-disable-next-line no-magic-numbers
    if (webpackVersion <= 3) {
      args.push(compilation.outputOptions);
      args.push(compilation.requestShortener);
      // eslint-disable-next-line no-magic-numbers
    } else if (webpackVersion >= 4) {
      args.push(compilation.runtimeTemplate);
    }

    const cachedSource = module.source(...args);

    return typeof cachedSource.replace === 'function'
      ? cachedSource
      : cachedSource._source;
  }

  /**
   * @param {NormalModule} module
   * @param {Replacement[]} replacements
   * @param {Compilation} compilation
   * @return {NormalModule}
   */
  static replaceInModuleSource(module, replacements, compilation) {
    if (module.type === MINI_EXTRACT_MODULE_TYPE) {
      replacements.forEach(({ token, replaceTo }) => {
        if (module.content.indexOf(token) < 0) {
          return;
        }

        const regExp = new RegExp(token, 'g');

        module.content = module.content.replace(regExp, replaceTo);
      });
      return module;
    }

    const source = Replacer.getModuleReplaceSource(module, compilation);
    const originalSourceContent = module.originalSource().source();

    replacements.forEach(({ token, replaceTo }) => {
      const indexes = Replacer.getAllStringOccurrences(originalSourceContent, token);

      indexes.forEach(idx => {
        const start = idx[0];
        const end = idx[1] - 1;

        const alreadyHasReplacement = source.replacements.find(r => (
          r[0] === start && r[1] === end && r[2] === replaceTo
        ));

        if (alreadyHasReplacement) {
          return;
        }

        source.replace(start, end, replaceTo);
      });
    });

    return module;
  }
};
