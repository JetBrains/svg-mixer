const { resolve, basename } = require('path');

const postcss = require('postcss');
const baker = require('svg-baker');

const plugin = require('..');

const spriteDefaultConfig = baker.Sprite.defaultConfig;

function findSpriteMsg(messages) {
  return messages.find(m => m.type === 'asset');
}

// Using fixtures dir path for shortly urls
const stylesheetPath = resolve(__dirname, 'fixtures/test.css');

function exec(input, opts) {
  return postcss()
    .use(plugin(opts))
    .process(input, {
      from: stylesheetPath
    })
    .then(res => {
      res.msg = findSpriteMsg(res.messages);
      res.sprite = res.msg.sprite;
      return res;
    });
}

describe('Options', () => {
  const input = '.a {background:url(twitter.svg)}';

  it('default', async () => {
    const { css } = await exec(input);
    expect(css).toMatchSnapshot();
  });

  it('match', async () => {
    let res = await exec(input, { match: '*.png' });
    res.css.should.eql(input);

    res = await exec(input, { match: ['*.svg', '!twitter*'] });
    res.css.should.eql(input);
  });

  it('format', async () => {
    let res = await exec(input);
    res.css.should.not.contain('::after');

    res = await exec(input, { format: 'flexible' });
    res.css.should.contain('::after');
  });

  it('aspectRatio', async () => {
    const { css } = await exec(input, { createAspectRatio: false });
    expect(css).toMatchSnapshot();
  });

  it('sprite', async () => {
    const {
      sprite,
      content: spriteContent
    } = await baker(resolve(__dirname, 'fixtures/twitter.svg'));

    const res = await exec(input, { sprite });

    expect(res.css).toMatchSnapshot();
    res.msg.content.should.eql(spriteContent);
  });

  describe('Override svg-baker compiler options', () => {
    it('spriteType', async () => {
      const res = await exec(input, { spriteType: 'stack' });
      res.css.should.contain('url(\'sprite.svg#twitter\')');
    });

    it('generateSymbolId', async () => {
      const expectedSymbolId = 'TWITTER';
      const res = await exec(input, {
        generateSymbolId: p => basename(p).replace('.svg', '').toUpperCase(),
        spriteType: 'stack'
      });
      res.css.should.contain(`url('sprite.svg#${expectedSymbolId}')`);
    });

    it('spriteConfig.filename', async () => {
      const expectedFilename = 'qwe.svg';
      const res = await exec(input, { spriteConfig: { filename: expectedFilename } });

      res.css
        .should.contain(`url('${expectedFilename}')`)
        .and.not.contain(`url('${spriteDefaultConfig.filename}')`);

      res.msg.file.should.eql(expectedFilename);
    });
  });
});

describe('Behaviour', () => {
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
