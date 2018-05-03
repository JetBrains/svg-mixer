const path = require('path');

const { getFixture, createInMemoryWebpackCompiler } = require('../../../test/utils');

const fixtureFile = 'twitter.svg';
const imageReq = './image.svg';
const entryName = 'main';
const entryReq = './entry.js';

module.exports.fixtureFile = fixtureFile;
module.exports.imageReq = imageReq;

async function compile(input, opts) {
  const compiler = createInMemoryWebpackCompiler({
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
  });

  const { data: fs } = compiler.inputFileSystem;

  fs['entry.js'] = new Buffer(input);
  fs[path.basename(imageReq)] = new Buffer(getFixture(fixtureFile));

  const { assets: rawAssets, errors } = await compiler.run();

  // Convert all assets to string
  const assets = Object.keys(rawAssets).reduce((acc, name) => {
    acc[name] = rawAssets[name].source().toString();
    return acc;
  }, {});

  const image = assets[path.basename(imageReq)];
  const entry = assets[`${entryName}.js`];

  return { assets, errors, image, entry };
}

module.exports.compile = compile;
