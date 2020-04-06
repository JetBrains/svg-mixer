const vm = require('vm');

const webpack = require('webpack');
const memoryFs = require('memory-fs');
const { createCompiler, getAssets } = require('svg-mixer-test').webpack;

function runScript(source) {
  const vmScript = new vm.Script(source, { filename: 'foo.js' });
  return vmScript.runInContext(vm.createContext());
}

module.exports.runScript = runScript;

/**
 * @param {Object} cfg Webpack config
 * @param {boolean} [returnAssets=false]
 * @returns {Promise<webpack.Compilation>}
 */
async function compile(cfg, returnAssets = true) {
  const compiler = createCompiler(cfg, {
    webpack,
    memoryFs
  });
  const compilation = await compiler.run();
  return returnAssets ? getAssets(compilation) : compilation;
}

module.exports.compile = compile;
