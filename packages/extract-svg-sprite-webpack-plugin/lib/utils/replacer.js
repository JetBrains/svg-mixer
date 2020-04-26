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
    const {
      dependencyTemplates,
      outputOptions,
      requestShortener,
      runtimeTemplate,
      moduleGraph,
      chunkGraph
    } = compilation;

    const args = [];

    // webpack 5
    if (moduleGraph && chunkGraph) {
      args.push({
        dependencyTemplates,
        runtimeTemplate,
        moduleGraph,
        chunkGraph
      });
    } else {
      args.push(dependencyTemplates);

      // webpack 3
      if (!runtimeTemplate) {
        args.push(outputOptions);
        args.push(requestShortener);
      }
      // webpack 4
      else {
        args.push(runtimeTemplate);
      }
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

    if (!source) {
      return module;
    }

    const originalSourceContent = module.originalSource().source();

    replacements.forEach(({ token, replaceTo }) => {
      const indexes = Replacer.getAllStringOccurrences(
        originalSourceContent,
        token
      );

      indexes.forEach(idx => {
        const start = idx[0];
        const end = idx[1] - 1;

        /**
         * source.replacements in webpack <= 4
         * source._replacements in webpack 5
         */
        const sourceReplacements = source.replacements || source._replacements;

        const alreadyHasReplacement = sourceReplacements.find(
          r => r[0] === start && r[1] === end && r[2] === replaceTo
        );

        if (alreadyHasReplacement) {
          return;
        }

        source.replace(start, end, replaceTo);
      });
    });

    return module;
  }
};
