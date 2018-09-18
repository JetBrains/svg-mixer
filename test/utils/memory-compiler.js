/* eslint-disable new-cap,no-magic-numbers */
const { resolve } = require('path');

let MemoryFs;

try {
  MemoryFs = require('memory-fs');
} catch (e) {
  // nothing
}

const NodeJsInputFileSystem = require('enhanced-resolve/lib/NodeJsInputFileSystem');
const CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');

const Compiler = require('./compiler');

module.exports = class MemoryCompiler extends Compiler {
  constructor(options) {
    const {
      memoryFs = MemoryFs,
      files,
      config
    } = options;

    if (files && config.plugins) {
      const loaderResolverFs = new CachedInputFileSystem(
        new NodeJsInputFileSystem(),
        60000
      );

      // see https://github.com/webpack/webpack/blob/2f78aae8d8f78ce9c9221ff25a0483d81809bd81/lib/WebpackOptionsApply.js#L503
      options.config.resolveLoader = Object.assign(
        options.config.resolveLoader || {},
        {
          fileSystem: loaderResolverFs
        }
      );
    }

    super(options);
    const { _compiler } = this;

    _compiler.outputFileSystem = new memoryFs();

    if (files) {
      const inputFs = new memoryFs();

      Object.keys(files).forEach(file => {
        // Prefix with webpack context
        const filePath = !file.startsWith('/')
          ? resolve(_compiler.context, file)
          : file;

        MemoryCompiler.createFile(filePath, files[file], inputFs);
      });

      _compiler.inputFileSystem = inputFs;
      _compiler.resolvers.normal.fileSystem = inputFs;
      _compiler.resolvers.context.fileSystem = inputFs;
    }
  }

  static createFile(path, content, fs) {
    const data = fs.data;
    const keys = path.replace(/^\//, '').split('/');

    if (keys.length > 1 && typeof data[''] === 'undefined') {
      data[''] = true;
    }

    const last = keys.pop();

    const res = keys.reduce(
      (acc, part) => acc[part] = acc[part] || { '': true },
      data
    );

    res[last] = !Buffer.isBuffer(content) ? Buffer.from(content) : content;
  }
};
