import Sprite from '../lib/sprite';
import SpriteSymbol from '../lib/symbol';

describe('svg-baker-runtime/sprite', () => {
  let sprite;
  let symbol;
  let fixture;

  beforeEach(() => {
    fixture = {
      id: 'foo',
      viewBox: '0 0 10 10',
      content: '<symbol id="foo"></symbol>'
    };
    sprite = new Sprite();
    symbol = new SpriteSymbol(fixture);
  });

  describe('add()', () => {
    it('should return symbol', () => {
      sprite.add(symbol).should.equal(symbol);
    });

    it('should replace symbol with same id', () => {
      sprite.add(symbol).should.be.equal(symbol);
      sprite.add(symbol).should.be.equal(symbol);

      sprite.symbols.should.be.lengthOf(1);
      sprite.symbols[0].should.be.equal(symbol);

      const newSymbol = new SpriteSymbol({ id: fixture.id, content: 'olalal' });
      sprite.add(newSymbol);

      sprite.symbols.should.be.lengthOf(1);
      sprite.symbols[0].should.be.equal(newSymbol);
    });
  });

  describe('remove()', () => {
    it('should remove symbol from list and call it `destroy` method', () => {
      const destroy = sinon.spy(symbol, 'destroy');

      sprite.add(symbol);
      sprite.remove(fixture.id);

      sprite.symbols.should.be.lengthOf(0);
      destroy.should.have.been.calledOnce;
      destroy.restore();
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
    it('should work like a charm', () => {
      sprite.has(fixture.id).should.be.false;
      sprite.add(symbol);
      sprite.has(fixture.id).should.be.true;
    });
  });

  describe('toString()', () => {
    it('should call `toString` on each symbol', () => {
      const toString = sinon.spy(symbol, 'toString');

      sprite.add(symbol);
      sprite.toString().should.be.a('string');
      toString.should.have.been.calledOnce;

      toString.restore();
    });
  });
});
