const { resolve } = require('path');

const { readFile, outputFile } = require('fs-extra');
const postcss = require('postcss');

function generateReadme(name, input, output, sprite) {
  return `
**[Demo](http://kisenka.github.com/svg-mixer/packages/postcss-svg-mixer/examples/${name}/demo.html)**
  
**Input**
\`\`\`css
${input}
\`\`\`

**Output**
\`\`\`css
${output}
\`\`\`

**Sprite**
\`\`\`svg
${sprite}
\`\`\`
`;
}

module.exports = async (name, plugins = []) => {
  const exampleDir = resolve(__dirname, name);
  const inputPath = resolve(exampleDir, 'input.css');
  const outputDir = resolve(exampleDir, 'output');

  const inputContent = await readFile(inputPath);
  const result = await postcss(Array.isArray(plugins) ? plugins : [plugins])
    .process(inputContent, { from: inputPath });

  const sprite = result.messages.find(m => m.kind === 'sprite');
  const readme = generateReadme(name, inputContent, result.css, sprite.content);

  await outputFile(resolve(outputDir, 'output.css'), result.css);
  await outputFile(resolve(outputDir, sprite.filename), sprite.content);
  await outputFile(resolve(exampleDir, 'README.md'), readme);
};
