const generator = require('./replacement-generator');

module.exports = (symbol, fields) => {
  const request = symbol.image.path + symbol.image.query;
  const requestReplacement = generator.symbolRequest(symbol).value;
  const bgPosLeft = generator.bgPosLeft(request).value;
  const bgPosTop = generator.bgPosTop(request).value;
  const bgSizeWidth = generator.bgSizeWidth(request).value;
  const bgSizeHeight = generator.bgSizeHeight(request).value;

  const runtimeFields = {
    id: `"${symbol.id}"`,
    width: `${symbol.width}`,
    height: `${symbol.height}`,
    viewBox: `"${symbol.viewBox.join(' ')}"`,
    url: `__webpack_public_path__ + "${requestReplacement}"`,
    toString: `function () { return __webpack_public_path__ + "${requestReplacement}"; }`,
    bgPosition: `{ left: "${bgPosLeft}", top: "${bgPosTop}" }`,
    bgSize: `{ width: "${bgSizeWidth}", height: "${bgSizeHeight}" }`
  };

  const runtime = `{
  ${Object.keys(runtimeFields)
    .filter(name => (fields ? fields.includes(name) : true))
    .map(name => `${name}: ${runtimeFields[name]}`)
    .join(',\n  ')}
}`;

  return runtime;
}
