/* eslint-disable quotes */
const { resolve, basename } = require('path');

const postcss = require('postcss');
const mixer = require('svg-mixer');
const { FIXTURES_DIR } = require('svg-mixer-test');

const { name: packageName } = require('../package.json');

const plugin = require('..');

const spriteDefaultConfig = mixer.Sprite.defaultConfig;
const fixturesStylesheetPath = resolve(FIXTURES_DIR, 'test.css'); // Using fixtures dir path for shortly urls
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
    expect(res.css).toEqual(defaultInput);

    res = await exec(defaultInput, { match: ['*.svg', '!twitter*'] });
    expect(res.css).toEqual(defaultInput);
  });

  it('sprite', async () => {
    const {
      sprite,
      content: spriteContent
    } = await mixer(resolve(FIXTURES_DIR, 'twitter.svg'));

    const res = await exec(defaultInput, { userSprite: sprite });

    expect(res.css).toMatchSnapshot();
    expect(res.msg.content).toEqual(spriteContent);
  });

  describe('Override svg-mixer compiler options', () => {
    it('spriteType', async () => {
      const { css } = await exec(defaultInput, { spriteType: 'stack' });

      expect(css.includes(`url('sprite.svg#twitter')`)).toBeTruthy();
    });

    it('generateSymbolId', async () => {
      const expectedSymbolId = 'TWITTER';
      const { css } = await exec(defaultInput, {
        generateSymbolId: p => basename(p).replace('.svg', '').toUpperCase(),
        spriteType: 'stack'
      });

      expect(css.includes(`url('sprite.svg#${expectedSymbolId}')`)).toBeTruthy();
    });

    it('spriteFilename', async () => {
      const expectedFilename = 'qwe.svg';
      const { css, msg } = await exec(defaultInput, { spriteFilename: expectedFilename });

      expect(css.includes(`url('${expectedFilename}')`)).toBeTruthy();
      expect(css.includes(`url('${spriteDefaultConfig.filename}')`)).toBeFalsy();
      expect(msg.filename).toEqual(expectedFilename);
    });
  });
});

describe('Behaviour', () => {
  it('should do nothing if no symbols was processed', async () => {
    const { css, messages } = await exec(defaultInput, { match: /qwe/ });

    expect(css).toEqual(defaultInput);
    expect(messages.length).toEqual(0);
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
    expect(msg.sprite.symbols).toHaveLength(1);
  });

  it('should treat same file with different query params as separate symbols', async () => {
    const input = `
.a{background:url(twitter.svg)}
.b{background:url(twitter.svg?qwe)}
.c{background:url(twitter.svg)}`;
    const { msg } = await exec(input);
    expect(msg.sprite.symbols).toHaveLength(2);
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
    expect(res.css).toMatch(`url('twitter.svg?spriteFilename=${filename}')`);

    // Should preserve any query params from original resource
    res = await exec('.a {background: url(twitter.svg?qwe)}', { ctx, spriteConfig: { filename } });
    expect(res.css).toMatch(`url('twitter.svg?qwe&spriteFilename=${filename}')`);
  });

  it('should emit sprite file', async () => {
    const filename = 'qwe.svg';
    const ctx = mockWebpackCtx();
    const { msg } = await exec(defaultInput, { ctx, spriteConfig: { filename } });
    expect(ctx.webpack.emitFile).toHaveBeenCalledWith(filename, msg.content);
  });
});
