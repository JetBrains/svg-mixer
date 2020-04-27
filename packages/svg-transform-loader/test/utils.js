const path = require('path');

const { getFixture } = require('svg-mixer-test');
const { createCompiler } = require('svg-mixer-test').webpack;

const fixtureFile = 'twitter.svg';
const imageReq = './image.svg';
const entryName = 'main';
const entryReq = './entry.js';

module.exports.fixtureFile = fixtureFile;
module.exports.imageReq = imageReq;

async function compile(input, opts) {
  const compiler = createCompiler({
    context: '/',

    entry: {
      [entryName]: entryReq
    },

    module: {
      rules: [
        {
          test: /\.svg/,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: { name: '[name].[ext]' }
            },
            {
              loader: require.resolve('../'),
              options: opts
            }
          ]
        }
      ]
    }
  }, { memoryInputFs: true });

  const { inputFileSystem: inputFs } = compiler;

  inputFs.data[path.basename(entryReq)] = new Buffer(input);
  inputFs.data[path.basename(imageReq)] = new Buffer(getFixture(fixtureFile));

  const { assets, errors } = await compiler.run();

  const image = assets[path.basename(imageReq)];
  const entry = assets[`${entryName}.js`];

  return { assets, errors, image, entry };
}

module.exports.compile = compile;
