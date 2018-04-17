const path = require('path');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const fixtureFile = 'twitter.svg';
const imageReq = './image.svg';
const entryName = 'main';
const entryReq = './entry.js';

module.exports.fixtureFile = fixtureFile;
module.exports.imageReq = imageReq;

function createCompiler(opts) {
  const cfg = {
    context: '/',

    entry: {
      [entryName]: entryReq
    },

    output: {
      filename: '[name].js'
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
              loader: path.resolve(__dirname, '../index.js'),
              options: opts
            }
          ]
        }
      ]
    }
  };

  const inputFs = new MemoryFS();
  const outputFs = new MemoryFS();

  const compiler = webpack(cfg);

  compiler.inputFileSystem = inputFs;
  compiler.resolvers.normal.fileSystem = inputFs;
  compiler.resolvers.context.fileSystem = inputFs;
  compiler.outputFileSystem = outputFs;

  return compiler;
}

module.exports.createCompiler = createCompiler;

async function compile(input, opts) {
  const compiler = createCompiler(opts);
  const { data: fsTree } = compiler.inputFileSystem;

  fsTree['entry.js'] = new Buffer(input);
  fsTree[path.basename(imageReq)] = new Buffer(utils.getFixture(fixtureFile));

  const { assets: rawAssets, errors } = await new Promise((resolve, reject) => {
    compiler.run((err, stats) => (err ? reject(err) : resolve(stats.compilation)));
  });

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
