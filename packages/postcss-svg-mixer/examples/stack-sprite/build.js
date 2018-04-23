const { basename } = require('path');
const mixer = require('postcss-svg-mixer');
const build = require('../build-example');

build(basename(__dirname), mixer({
  prettify: true,
  spriteType: 'stack'
}));
