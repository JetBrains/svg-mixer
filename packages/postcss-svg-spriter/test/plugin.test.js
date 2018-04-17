const { resolve, basename } = require('path');

const postcss = require('postcss');
const baker = require('svg-baker');

const { name: packageName } = require('../package.json');

const plugin = require('..');

const FORMAT = require('../format');

const spriteDefaultConfig = baker.Sprite.defaultConfig;
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
      const msg = findSpriteMsg(res.messages);

      if (msg) {
        res.msg = msg;
        res.sprite = msg.sprite;
        res.spriteContent = msg.content;
      }

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

    res = await exec(defaultInput, { format: FORMAT.FULL });
    res.css.should.contain('::after');
  });

  it('aspectRatio', async () => {
    const { css } = await exec(defaultInput, { createAspectRatio: false });
    expect(css).toMatchSnapshot();
  });

  it('sprite', async () => {
    console.log(resolve(utils.fixturesDir, 'twitter.svg'));

    const {
      sprite,
      content: spriteContent
    } = await baker(resolve(utils.fixturesDir, 'twitter.svg'));

    const res = await exec(defaultInput, { sprite });

    expect(res.css).toMatchSnapshot();
    res.msg.content.should.eql(spriteContent);
  });

  describe('Override svg-baker compiler options', () => {
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

      res.msg.file.should.eql(expectedFilename);
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
    const { messages, sprite } = await exec(defaultInput, { spriteConfig: { filename } });
    const spriteContent = await sprite.render();
    const msg = findSpriteMsg(messages);

    msg.plugin.should.eql(packageName);
    msg.file.should.eql(filename);
    msg.type.should.eql('asset');
    msg.kind.should.eql('sprite');
    msg.content.should.eql(spriteContent);
    msg.sprite.should.eql(sprite);
  });

  it('should reuse symbols with the same url', async () => {
    const input = '.a{background:url(twitter.svg)}.b{background:url(twitter.svg)}';
    const { sprite } = await exec(input);
    sprite.symbols.length.should.eql(1);
  });

  it('should treat same file with different query params as separate symbols', async () => {
    const input = `
.a{background:url(twitter.svg)}
.b{background:url(twitter.svg?qwe)}
.c{background:url(twitter.svg)}`;
    const { sprite } = await exec(input);
    sprite.symbols.length.should.eql(2);
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
    const { spriteContent } = await exec(defaultInput, { ctx, spriteConfig: { filename } });
    expect(ctx.webpack.emitFile).toHaveBeenCalledWith(filename, spriteContent);
  });
});
