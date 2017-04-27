const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const glob = require('glob');
const SpriteSymbol = require('svg-baker/lib/symbol');

const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const fixturesDir = path.resolve(__dirname, '../test/fixtures');

const files = glob.sync(`${fixturesDir}/*.svg`, { absolute: true });
const promises = [];

// eslint-disable-next-line no-restricted-syntax
for (const file of files) {
  const id = path.basename(file).split('.')[0];

  promises.push(async () => {
    const content = await readFile(file, 'utf-8');
    const symbol = await SpriteSymbol.create({
      id,
      content,
      request: file
    });
    return symbol;
  });
}

Promise.all(promises.map(p => p())).then((symbols) => {
  const data = [];

  symbols.forEach((symbol) => {
    data.push({
      id: symbol.id,
      useId: symbol.useId,
      viewBox: symbol.viewBox,
      content: symbol.render()
    });
  });

  return writeFile(
    `${fixturesDir}/data.json`,
    JSON.stringify(data, null, 2)
  );
});
