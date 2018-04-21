const { resolve, dirname } = require('path');

const {
  Compiler,
  CompilerResult,
  Sprite,
  StackSprite,
  SpriteSymbol
} = require('svg-mixer');

const c = Compiler.create;
const logosPackage = dirname(require.resolve('@jetbrains/logos'));

it('constructor', () => {
  expect(c().config.spriteClass).toEqual(Sprite);
  expect(
    c({ spriteType: StackSprite.TYPE }).config.spriteClass
  ).toEqual(StackSprite);
});

it('addSymbolFromFile', async () => {
  const compiler = c();
  await compiler.addSymbolFromFile(resolve(`${logosPackage}/appcode/appcode.svg`));

  expect(compiler.symbols).toHaveLength(1);
  expect(compiler.symbols[0]).toBeInstanceOf(SpriteSymbol);
});

it('createSymbol', async () => {
  const res = c().createSymbol({ path: '/foo', content: '<svg></svg>' });
  expect(res).toBeInstanceOf(SpriteSymbol);
});

it('compile()', async () => {
  const compiler = c();
  await compiler.glob(`${logosPackage}/appcode/*.svg`);
  expect(await compiler.compile()).toBeInstanceOf(CompilerResult);
});

it('glob()', async () => {
  const compiler = c();
  await compiler.glob(resolve(`${logosPackage}/appcode/*.svg`));
  expect(compiler.symbols).toHaveLength(2);

  await compiler.glob([resolve(`${logosPackage}/appcode/appcode.svg`)]);
  expect(compiler.symbols).toHaveLength(2);

});
