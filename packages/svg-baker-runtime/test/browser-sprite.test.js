import Sprite from '../src/browser-sprite';
import SpriteSymbol from '../src/browser-symbol';
import {
  parse,
  wrapInSvgString,
  arrayFrom,
  dispatchCustomEvent
} from '../src/utils';

/**
 * @type {Array}
 */
const symbolsFixtures = require('./fixtures/data.json');

function createBaseTag(href) {
  const baseTagHref = href || window.location.href.split('#')[0];

  const baseTag = document.createElement('base');
  baseTag.setAttribute('href', baseTagHref);
  document.querySelector('head').appendChild(baseTag);
}

function removeBaseTag() {
  const baseTag = document.querySelector('base');
  baseTag.parentNode.removeChild(baseTag);
}

function mockAngular() {
  return {
    module() {
      return {
        run() {}
      };
    }
  };
}

describe('svg-baker-runtime/browser-sprite', () => {
  describe('constructor()', () => {
    it('should assign default config properly', () => {
      const sprite = new Sprite({ qwe: 123 });

      sprite.config.should.have.property('attrs');
      sprite.config.should.have.property('qwe');
      sprite.node.should.be.false;
      sprite.isMounted.should.be.false;
    });

    it.only('should sync sprite urls with base tag url when sprite is mounted', () => {
      const baseUrl = window.location.href;
      createBaseTag(baseUrl);

      const sprite = new Sprite();
      sprite.add(new SpriteSymbol(symbolsFixtures[0]));

      const node = sprite.mount();
      const elemsWithUrl = arrayFrom(node.querySelectorAll('[fill^="url("]'));

      elemsWithUrl.forEach((elem) => {
        const fill = elem.getAttribute('fill');
        const expectedIndex = 0;
        const actualIndex = fill.indexOf(`url(${baseUrl}`);
        actualIndex.should.be.equal(expectedIndex);
      });
    });

    it('should subscribe to locationChange event and call updateUrls when it occurs', () => {
      const sprite = new Sprite();
      const updateUrls = sinon.spy(sprite, 'updateUrls');

      sprite.mount();
      dispatchCustomEvent(sprite.config.locationChangeEvent, {});
      updateUrls.should.have.been.calledOnce;

      updateUrls.restore();
    });
  });

  describe('autoConfigure()', () => {
    it('should detect when base tag fix needed', () => {
      const prop = 'syncUrlsWithBaseTag';
      let config;

      config = new Sprite().config;
      expect(config[prop]).to.be.false;

      createBaseTag();
      config = new Sprite().config;
      expect(config[prop]).to.be.true;
      removeBaseTag();

      createBaseTag();
      config = new Sprite({ [prop]: false }).config;
      expect(config[prop]).to.be.false;
      removeBaseTag();
    });

    it('should detect when Angular base tag fix needed', () => {
      const prop = 'locationChangeAngularEmitter';
      let config;

      config = new Sprite().config;
      expect(config[prop]).to.be.false;

      window.angular = mockAngular();
      config = new Sprite().config;
      expect(config[prop]).to.be.true;
      delete window.angular;
    });

    it('should detect when Firefox gradients fix needed', () => {
      // TODO
    });
  });

  describe('updateUrls()', () => {
    it('should throw if sprite isn\'t mounted', () => {
      expect(
        () => new Sprite().updateUrls('', '')
      ).to.throw();
    });

    it('should update urls in sprite symbols and in references', () => {
      const sprite = new Sprite();
      sprite.add(new SpriteSymbol(symbolsFixtures[0]));
      sprite.mount();

      const ref = parse(wrapInSvgString('<use xlink:href="#twitter"></use>'));
      document.body.appendChild(ref);

      console.log(
        document.querySelector('html').outerHTML
      );
    });
  });
});
