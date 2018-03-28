const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const Image = require('../image');

const getBasename = require('./get-basename');

const readFile = promisify(fs.readFile);

/**
 * @param {string|{path: string, id: string}} pathOrOpts
 * @return {Promise<Image>}
 */
module.exports = function createImageFromFile(pathOrOpts) {
  const optsIsPath = typeof pathOrOpts === 'string';
  const filePath = path.resolve(optsIsPath ? pathOrOpts : pathOrOpts.path);
  const id = !optsIsPath && pathOrOpts.id ? pathOrOpts.id : getBasename(pathOrOpts);

  return readFile(filePath).then(content => new Image({
    id,
    path: filePath,
    content: content.toString()
  }));
};
