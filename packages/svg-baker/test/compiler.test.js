const { resolve, dirname } = require('path');

const { Compiler, Sprite } = require('svg-baker');

const c = Compiler.create;
const logosPackage = dirname(require.resolve('@jetbrains/logos'));

describe('svg-baker/compiler', () => {
  it('constructor()', () => {
    c().config.spriteClass.name.should.eql('Sprite');
    c({ mode: 'stack' }).config.spriteClass.name.should.eql('StackSprite');
  });

  it('glob()', async () => {
    (await c().glob(resolve(`${logosPackage}/appcode/*.svg`)))
      .length.should.eql(2);

    (await c().glob([resolve(`${logosPackage}/appcode/appcode.svg`)]))
      .length.should.eql(1);
  });

  it('addFiles()', async () => {
    (await c().addFiles([
      resolve(`${logosPackage}/appcode/appcode.svg`),
      resolve(`${logosPackage}/teamcity/teamcity.svg`)
    ])).length.should.eql(2);
  });

  it('compile()', async () => {
    const compiler = c();
    await compiler.glob(`${logosPackage}/appcode/*.svg`);
    (await compiler.compile())
      .should.be.instanceOf(Sprite);
  });
});
