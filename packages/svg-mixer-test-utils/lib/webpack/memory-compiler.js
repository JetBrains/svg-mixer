/* eslint-disable new-cap,no-magic-numbers,func-names,func-names,prefer-arrow-callback */
const { resolve } = require('path');
const fs = require('fs');

let MemoryFs;
let NodeJsInputFileSystem;
let CachedInputFileSystem;

try {
  MemoryFs = require('memory-fs');
  NodeJsInputFileSystem = require('enhanced-resolve/lib/NodeJsInputFileSystem');
  CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');
} catch (e) {
  // nothing
}

const Compiler = require('./compiler');

module.exports = class MemoryCompiler extends Compiler {
  /**
   *
   * @param {Object} options
   * @param {Object} options.config Webpack config
   * @param {Object<string, string>} options.files
   */
  constructor(options) {
    const {
      memoryFs = MemoryFs,
      files,
      config
    } = options;

    if (files && config.plugins && NodeJsInputFileSystem && CachedInputFileSystem) {
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

    _compiler.outputFileSystem = MemoryCompiler.wrapMemoryFs(new memoryFs());

    if (files) {
      const inputFs = MemoryCompiler.wrapMemoryFs(new memoryFs());

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

  static createFile(path, content, _fs) {
    const data = _fs.data;
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

  static wrapMemoryFs(memoryFs) {
    const statOrig = memoryFs.stat.bind(memoryFs);
    const readFileOrig = memoryFs.readFile.bind(memoryFs);

    memoryFs.stat = function (_path, cb) {
      statOrig(_path, function (err, result) {
        if (err) {
          return fs.stat(_path, cb);
        } else {
          return cb(err, result);
        }
      });
    };

    memoryFs.readFile = function (path, cb) {
      readFileOrig(path, function (err, result) {
        if (err) {
          return fs.readFile(path, cb);
        } else {
          return cb(err, result);
        }
      });
    };

    return memoryFs;
  }
};
