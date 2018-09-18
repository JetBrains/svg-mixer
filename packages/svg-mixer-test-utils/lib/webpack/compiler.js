/* eslint-disable new-cap */
let _webpack;

try {
  _webpack = require('webpack');
} catch (e) {
  // nothing
}

module.exports = class Compiler {
  constructor(options) {
    const {
      webpack = _webpack,
      config,
      inputFs,
      outputFs
    } = options;

    const compiler = webpack(config);

    if (inputFs) {
      compiler.inputFileSystem = inputFs;
    }

    if (outputFs) {
      compiler.outputFileSystem = outputFs;
    }

    this._compiler = compiler;
  }

  async run() {
    return new Promise((resolve, reject) => {
      this._compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }

        if (stats.compilation.errors.length > 0) {
          const msg = stats.compilation.errors
            .map(e => (typeof e === 'string' ? e : `${e.message}\n${e.stack}`))
            .join('\n');
          return reject(new Error(msg));
        }

        return resolve(stats.compilation);
      });
    });
  }

  async runAndGetAssets() {
    const { assets } = await this.run();
    return Object.keys(assets).reduce((acc, name) => {
      acc[name] = assets[name].source().toString().trim();
      return acc;
    }, {});
  }
};
