const { resolve } = require('path');

const { readFile, outputFile } = require('fs-extra');
const postcss = require('postcss');

module.exports = async (name, plugins = []) => {
  const exampleDir = resolve(__dirname, name);
  const inputPath = resolve(exampleDir, 'input.css');
  const outputDir = resolve(exampleDir, 'output');

  const inputContent = await readFile(inputPath);
  const result = await postcss(Array.isArray(plugins) ? plugins : [plugins])
    .process(inputContent, { from: inputPath });

  const sprite = result.messages.find(m => m.kind === 'sprite');

  await outputFile(resolve(outputDir, 'output.css'), result.css);
  await outputFile(resolve(outputDir, sprite.filename), sprite.content);
};
