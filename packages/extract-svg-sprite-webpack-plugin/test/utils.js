const vm = require('vm');

const webpack = require('webpack');
const memoryFs = require('memory-fs');
const { createCompiler } = require('svg-mixer-test').webpack;

function runScript(source) {
  const vmScript = new vm.Script(source, { filename: 'foo.js' });
  return vmScript.runInContext(
    vm.createContext({
      module
    })
  );
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
  const result = await compiler.run();
  return returnAssets ? result.assets : result;
}

module.exports.compile = compile;
