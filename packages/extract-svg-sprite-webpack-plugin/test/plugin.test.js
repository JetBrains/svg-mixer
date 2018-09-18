const { compile, compileRuntime } = require('./utils');

describe('plugin', () => {
  it('runtime', async () => {
    const assets = await compile(require('./runtime/default/webpack.config'));
    const runtime = compileRuntime(assets['main.js']);

    expect(runtime.id).to.equal('twitter');
    expect(runtime.url).to.equal('sprite.svg');
    expect(runtime.width).to.equal(273.4);
  });

});
