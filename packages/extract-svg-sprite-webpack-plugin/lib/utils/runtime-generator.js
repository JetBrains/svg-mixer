const generator = require('./replacement-generator');

const stringify = JSON.stringify;

/**
 * @param {mixer.SpriteSymbol} symbol
 * @param {ExtractSvgSpritePluginConfig} config
 * @return {string}
 */
module.exports = (symbol, config) => {
  const request = symbol.image.path + symbol.image.query;
  const requestReplacement = generator.symbolRequest(symbol, config).value;
  const bgPosLeft = generator.bgPosLeft(request).value;
  const bgPosTop = generator.bgPosTop(request).value;
  const bgSizeWidth = generator.bgSizeWidth(request).value;
  const bgSizeHeight = generator.bgSizeHeight(request).value;

  const publicPath = config.publicPath
    ? stringify(config.publicPath)
    : '__webpack_public_path__';

  // Do not add public path when there is no sprite filename
  const urlExpr = config.filename && config.emit
    ? `${publicPath} + ${stringify(requestReplacement)}`
    : `${stringify(requestReplacement)}`;

  const runtimeParts = {
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
  ${Object.keys(runtimeParts)
    .filter(name => (config.runtimeFields ? config.runtimeFields.includes(name) : true))
    .map(name => `${name}: ${runtimeParts[name]}`)
    .join(',\n  ')}
}`;

  return runtime;
};
