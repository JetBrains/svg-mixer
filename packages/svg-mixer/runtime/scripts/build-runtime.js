/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const Promise = require('bluebird');
const rollup = require('rollup');
const resolvePlugin = require('rollup-plugin-node-resolve');
const commonjsPlugin = require('rollup-plugin-commonjs');
const bublePlugin = require('rollup-plugin-buble');

const root = path.resolve(__dirname, '..');
const srcPath = path.resolve(root, 'src');
const destPath = root;

const entries = [
  {
    src: `${srcPath}/sprite.js`,
    dest: `${destPath}/sprite.js`,
    moduleName: 'Sprite'
  },
  {
    src: `${srcPath}/symbol.js`,
    dest: `${destPath}/symbol.js`,
    moduleName: 'SpriteSymbol'
  },
  {
    src: `${srcPath}/browser-sprite.js`,
    dest: `${destPath}/browser-sprite.js`,
    moduleName: 'BrowserSprite'
  },
  {
    src: `${srcPath}/browser-symbol.js`,
    dest: `${destPath}/browser-symbol.js`,
    moduleName: 'BrowserSpriteSymbol'
  }
];

Promise.map(entries, ({ src, dest, moduleName }) => {
  return rollup.rollup({
    entry: src,
    format: 'umd',
    plugins: [
      resolvePlugin(),
      commonjsPlugin(),
      bublePlugin()
    ]
  }).then((bundle) => {
    return bundle.write({
      dest,
      moduleName,
      format: 'umd'
    });
  });
});
