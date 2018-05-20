const generator = require('./replacement-generator');

const stringify = JSON.stringify;

module.exports = (symbol, fields, publicPath) => {
  const request = symbol.image.path + symbol.image.query;
  const requestReplacement = generator.symbolRequest(symbol).value;
  const bgPosLeft = generator.bgPosLeft(request).value;
  const bgPosTop = generator.bgPosTop(request).value;
  const bgSizeWidth = generator.bgSizeWidth(request).value;
  const bgSizeHeight = generator.bgSizeHeight(request).value;

  const urlExpr = symbol.config.filename
    ? `${publicPath} + ${stringify(requestReplacement)}`
    : `${stringify(requestReplacement)}`;

  const runtimeFields = {
    id: `${stringify(symbol.id)}`,
    width: `${symbol.width}`,
    height: `${symbol.height}`,
    viewBox: `${stringify(symbol.viewBox.join(' '))}`,
    url: urlExpr,
    toString: `function () { return ${urlExpr}; }`,
    bgPosition: `{ left: ${stringify(bgPosLeft)}, top: ${stringify(bgPosTop)} }`,
    bgSize: `{ width: ${stringify(bgSizeWidth)}, height: ${stringify(bgSizeHeight)} }`
  };

  const runtime = `module.exports = {
  ${Object.keys(runtimeFields)
    .filter(name => (fields ? fields.includes(name) : true))
    .map(name => `${name}: ${runtimeFields[name]}`)
    .join(',\n  ')}
}`;

  return runtime;
}
