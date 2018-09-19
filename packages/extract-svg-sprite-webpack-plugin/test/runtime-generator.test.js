const merge = require('lodash.merge');
const { FIXTURES_DIR } = require('svg-mixer-test-utils');
const { SpriteSymbol } = require('svg-mixer');
const defaultConfig = require('extract-svg-sprite-webpack-plugin/lib/config');
const Generator = require('extract-svg-sprite-webpack-plugin/lib/utils/runtime-generator');

const { exec } = require('./utils');

function generate(symbol, config) {
  const cfg = merge({}, defaultConfig.plugin, config);
  const generator = new Generator(symbol, cfg);
  const code = `var symbol = ${generator.generate()}; symbol;`;
  return exec(code, {
    sandbox: {
      // eslint-disable-next-line camelcase
      __webpack_public_path__: ''
    }
  });
}

describe('Runtime generator', () => {
  let symbol;
  beforeEach(async () => {
    symbol = await SpriteSymbol.fromFile(__dirname, `${FIXTURES_DIR}/twitter.svg`);
  });

  it('default', () => {
    const runtime = generate(symbol);
    const props = {
      id: 'string',
      url: 'string',
      width: 'number',
      height: 'number',
      viewBox: 'string',
      toString: 'function',
      backgroundSize: 'string',
      backgroundPosition: 'string'
    };

    expect(
      Object.keys(runtime).sort().join(', ')
    ).to.equal(
      Object.keys(props).sort().join(', ')
    );

    Object.keys(props).forEach(prop => {
      expect(runtime).have.property(prop).and.be.a(props[prop]);
    });

    expect(runtime.toString()).to.be.a('string');
  });

  it('spriteType=stack', () => {
    const runtime = generate(symbol, {
      spriteType: 'stack'
    });
    const props = {
      id: 'string',
      url: 'string',
      width: 'number',
      height: 'number',
      viewBox: 'string',
      toString: 'function'
    };

    expect(
      Object.keys(runtime).sort().join(', ')
    ).to.equal(
      Object.keys(props).sort().join(', ')
    );

    Object.keys(props).forEach(prop => {
      expect(runtime).have.property(prop).and.be.a(props[prop]);
    });
  });

  it('publicPath', () => {
    const runtime = generate(symbol, { publicPath: '/foo' });
    expect(runtime.url).contain('/foo');
    expect(runtime.toString()).contain('/foo');
  });
});
