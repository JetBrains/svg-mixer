const { resolve, basename } = require('path');

const postcss = require('postcss');
const mixer = require('svg-mixer');

const { name: packageName } = require('../package.json');

const plugin = require('..');

const FORMAT = require('../lib/format');

const spriteDefaultConfig = mixer.Sprite.defaultConfig;
const fixturesStylesheetPath = resolve(utils.fixturesDir, 'test.css'); // Using fixtures dir path for shortly urls
const defaultInput = '.a {background:url(twitter.svg)}';

function findSpriteMsg(messages) {
  return messages.find(m => m.kind === 'sprite');
}

function exec(input, opts) {
  return postcss()
    .use(plugin(opts))
    .process(input, { from: fixturesStylesheetPath })
    .then(res => {
      res.msg = findSpriteMsg(res.messages) || undefined;
      return res;
    });
}

describe('Options', () => {
  it('default', async () => {
    const { css } = await exec(defaultInput);
    expect(css).toMatchSnapshot();
  });

  it('match', async () => {
    let res = await exec(defaultInput, { match: '*.png' });
    res.css.should.eql(defaultInput);

    res = await exec(defaultInput, { match: ['*.svg', '!twitter*'] });
    res.css.should.eql(defaultInput);
  });

  it('format', async () => {
    let res = await exec(defaultInput, { format: FORMAT.PLAIN });
    res.css.should.not.contain('::after');

    res = await exec(defaultInput, { format: FORMAT.EXTENDED });
    res.css.should.contain('::after');
  });

  it('aspectRatio', async () => {
    const { css } = await exec(defaultInput, { createAspectRatio: false });
    expect(css).toMatchSnapshot();
  });

  it('sprite', async () => {
    const {
      sprite,
      content: spriteContent
    } = await mixer(resolve(utils.fixturesDir, 'twitter.svg'));

    const res = await exec(defaultInput, { sprite });

    expect(res.css).toMatchSnapshot();
    res.msg.content.should.eql(spriteContent);
  });

  describe('Override svg-mixer compiler options', () => {
    it('spriteType', async () => {
      const res = await exec(defaultInput, { spriteType: 'stack' });
      res.css.should.contain('url(\'sprite.svg#twitter\')');
    });

    it('generateSymbolId', async () => {
      const expectedSymbolId = 'TWITTER';
      const res = await exec(defaultInput, {
        generateSymbolId: p => basename(p).replace('.svg', '').toUpperCase(),
        spriteType: 'stack'
      });
      res.css.should.contain(`url('sprite.svg#${expectedSymbolId}')`);
    });

    it('spriteConfig.filename', async () => {
      const expectedFilename = 'qwe.svg';
      const res = await exec(defaultInput, { spriteConfig: { filename: expectedFilename } });

      res.css
        .should.contain(`url('${expectedFilename}')`)
        .and.not.contain(`url('${spriteDefaultConfig.filename}')`);

      res.msg.filename.should.eql(expectedFilename);
    });
  });
});

describe('Behaviour', () => {
  it('should do nothing if no symbols was processed', async () => {
    const { css, messages } = await exec(defaultInput, { match: /qwe/ });
    css.should.be.eql(defaultInput);
    messages.length.should.be.eql(0);
  });

  it('should add message with sprite info', async () => {
    const filename = 'qwe.svg';
    const { msg } = await exec(defaultInput, { spriteConfig: { filename } });

    expect(msg.plugin).toEqual(packageName);
    expect(msg.type).toEqual('asset');
    expect(msg.kind).toEqual('sprite');
    expect(msg.sprite).toBeInstanceOf(mixer.Sprite);
    expect(msg.filename).toEqual(filename);
    expect(await msg.sprite.render()).toEqual(msg.content);
  });

  it('should emit error if image not found', async () => {
    await expect(exec('.a {background :   url(fooo.svg)}'))
      .rejects.toThrowError();
  });

  it('should reuse symbols with the same url', async () => {
    const input = '.a{background:url(twitter.svg)}.b{background:url(twitter.svg)}';
    const { msg } = await exec(input);
    msg.sprite.symbols.length.should.eql(1);
  });

  it('should treat same file with different query params as separate symbols', async () => {
    const input = `
.a{background:url(twitter.svg)}
.b{background:url(twitter.svg?qwe)}
.c{background:url(twitter.svg)}`;
    const { msg } = await exec(input);
    msg.sprite.symbols.length.should.eql(2);
  });
});

describe('Webpack postcss-loader interop', () => {
  function mockWebpackCtx() {
    return {
      webpack: {
        emitFile: jest.fn()
      }
    };
  }

  it('should use special sprite URL', async () => {
    const filename = 'qwe.svg';
    const ctx = mockWebpackCtx();

    let res = await exec(defaultInput, { ctx, spriteConfig: { filename } });
    res.css.should.contain(`url('twitter.svg?spriteFilename=${filename}')`);

    // Should preserve any query params from original resource
    res = await exec('.a {background: url(twitter.svg?qwe)}', { ctx, spriteConfig: { filename } });
    res.css.should.contain(`url('twitter.svg?qwe&spriteFilename=${filename}')`);
  });

  it('should emit sprite file', async () => {
    const filename = 'qwe.svg';
    const ctx = mockWebpackCtx();
    const { msg } = await exec(defaultInput, { ctx, spriteConfig: { filename } });
    expect(ctx.webpack.emitFile).toHaveBeenCalledWith(filename, msg.content);
  });
});
