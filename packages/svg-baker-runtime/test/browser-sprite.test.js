import Sprite from '../src/browser-sprite';
import SpriteSymbol from '../src/symbol';
import {
  parse,
  wrapInSvgString,
  dispatchCustomEvent
} from '../src/utils';

function createBaseTag() {
  const baseTag = document.createElement('base');
  baseTag.setAttribute('href', window.location.href.split('#')[0]);
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

const symbolData = {
  id: 'twitter',
  use: 'twitter-usage',
  viewBox: '0 0 273.4 222.2',
  content: '<symbol viewBox="0 0 273.4 222.2" id="twitter"><path d="M273.4 26.3c-10.1 4.5-20.9 7.5-32.2 8.8 11.6-6.9 20.5-17.9 24.7-31-10.9 6.4-22.9 11.1-35.7 13.6A55.919 55.919 0 0 0 189.3 0c-31 0-56.1 25.1-56.1 56.1 0 4.4.5 8.7 1.5 12.8C88 66.5 46.7 44.2 19 10.3c-4.8 8.3-7.6 17.9-7.6 28.2 0 19.5 9.9 36.6 25 46.7-9.2-.3-17.8-2.8-25.4-7v.7c0 27.2 19.3 49.8 45 55-4.7 1.3-9.7 2-14.8 2-3.6 0-7.1-.4-10.6-1 7.1 22.3 27.9 38.5 52.4 39-19.2 15-43.4 24-69.7 24-4.5 0-9-.3-13.4-.8 24.8 15.9 54.3 25.2 86 25.2 103.2 0 159.6-85.5 159.6-159.6 0-2.4-.1-4.9-.2-7.3 11.1-8 20.6-17.9 28.1-29.1z" /></symbol>'
};

describe('svg-baker-runtime/browser-sprite', () => {
  describe('constructor()', () => {
    it('should assign default config properly', () => {
      const sprite = new Sprite({ qwe: 123 });

      sprite.config.should.have.property('attrs');
      sprite.config.should.have.property('qwe');
      sprite.node.should.be.false;
      sprite.isMounted.should.be.false;
    });

    it('should autodetect when base tag fix needed', () => {
      let config;

      config = new Sprite().config;
      expect(config.baseFix).to.be.false;

      createBaseTag();
      config = new Sprite().config;
      expect(config.baseFix).to.be.true;
      removeBaseTag();

      createBaseTag();
      config = new Sprite({ baseFix: false }).config;
      expect(config.baseFix).to.be.false;
      removeBaseTag();
    });

    it('should autodetect when Angular base tag fix needed', () => {
      let config;

      config = new Sprite().config;
      expect(config.angularBaseFix).to.be.false;

      window.angular = mockAngular();
      config = new Sprite().config;
      expect(config.angularBaseFix).to.be.true;
      delete window.angular;

      window.angular = mockAngular();
      config = new Sprite({ angularBaseFix: false }).config;
      expect(config.angularBaseFix).to.be.false;
      delete window.angular;
    });

    it('should subscribe to location updated event and call `updateUrls` when it occurs', () => {
      const sprite = new Sprite();
      const updateUrls = sinon.spy(sprite, 'updateUrls');

      sprite.mount();
      dispatchCustomEvent(sprite.config.locationChangeEvent, {});
      updateUrls.should.have.been.calledOnce;

      updateUrls.restore();
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
      sprite.add(new SpriteSymbol(symbolData));
      sprite.mount();

      const ref = parse(wrapInSvgString('<use xlink:href="#twitter"></use>'));
      document.body.appendChild(ref);

      console.log(
        document.querySelector('html').outerHTML
      );
    });
  });
});
