module.exports = class RemoveAssetPlugin {
  constructor(files) {
    this.files = files;
  }

  do(compilation, done) {
    this.files.forEach(filename => delete compilation.assets[filename]);
    done();
  }

  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.emit.tapAsync(__filename, (c, callback) => this.do(c, callback));
    } else {
      compiler.plugin('emit', (c, callback) => this.do(c, callback));
    }
  }
};
