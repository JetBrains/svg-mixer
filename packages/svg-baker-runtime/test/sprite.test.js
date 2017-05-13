import Sprite from '../src/sprite';
import SpriteSymbol from '../src/symbol';

const symbolsFixtures = require('./fixtures/data.json');

const fixture = symbolsFixtures[0];

describe('svg-baker-runtime/sprite', () => {
  let sprite;
  let symbol;

  beforeEach(() => {
    sprite = new Sprite();
    symbol = new SpriteSymbol(fixture);
  });

  describe('add()', () => {
    it('should add symbols, should return `true` if new symbol was added, `false` otherwise', () => {
      const symbol2 = new SpriteSymbol(fixture);
      const symbol3 = new SpriteSymbol(fixture);
      symbol3.id = `${sprite.id}_foo`;

      sprite.add(symbol).should.be.true;
      sprite.symbols.should.be.lengthOf(1);
      sprite.add(symbol2).should.be.false;
      sprite.symbols.should.be.lengthOf(1);
      sprite.add(symbol3).should.be.true;
      sprite.symbols.should.be.lengthOf(2);
    });
  });

  describe('remove()', () => {
    it('should remove symbol from storage and call it `destroy` method, `true` is returned', () => {
      const destroy = sinon.spy(symbol, 'destroy');

      sprite.add(symbol);
      const result = sprite.remove(symbol.id);

      result.should.be.true;
      sprite.symbols.should.be.lengthOf(0);
      destroy.should.have.been.calledOnce;
    });

    it('should return `false` if symbol not found', () => {
      sprite.add(symbol);
      const result = sprite.remove(`${symbol.id}__qwe`);

      result.should.be.false;
      sprite.symbols.should.be.lengthOf(1);
    });
  });

  describe('find()', () => {
    it('should find symbol or return null', () => {
      expect(sprite.find(fixture.id)).to.be.null;
      sprite.add(symbol);
      sprite.find(fixture.id).should.be.equal(symbol);
    });
  });

  describe('has()', () => {
    it('should return true if symbol with id exist, false otherwise', () => {
      sprite.has(fixture.id).should.be.false;
      sprite.add(symbol);
      sprite.has(fixture.id).should.be.true;
    });
  });

  describe('stringify()', () => {
    it('should call `stringify` on each symbol', () => {
      const stringify = sinon.spy(symbol, 'stringify');

      sprite.add(symbol);
      sprite.stringify().should.be.a('string');
      stringify.should.have.been.calledOnce;
    });
  });
});
