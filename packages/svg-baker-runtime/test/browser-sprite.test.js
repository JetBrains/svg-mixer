import ns from 'svg-baker/namespaces';
import { collectUrls, createBaseTag, createUse, mockAngular, removeBaseTag, remove } from './_utils';
import { dispatchCustomEvent } from '../src/utils';
import Sprite from '../src/browser-sprite';
import SpriteSymbol from '../src/browser-symbol';

/**
 * @type {Array}
 */
const symbolsFixtures = require('./fixtures/data.json');

const symbolFixture = symbolsFixtures[0];

describe('svg-baker-runtime/browser-sprite', () => {
  let sprite;

  afterEach(() => {
    try {
      sprite.destroy();
    } catch (e) {
      // nothing
    }
  });

  describe('constructor()', () => {
    const opts = { listenLocationChangeEvent: false };

    it('should assign default config properly', () => {
      sprite = new Sprite({ qwe: 123, ...opts });

      sprite.config.should.have.property('attrs');
      sprite.config.should.have.property('qwe');
      expect(sprite.node).to.be.null;
      sprite.isMounted.should.be.false;
    });

    it('should sync sprite URLs with base tag URL when sprite is mounted', () => {
      const baseUrl = window.location.href;
      createBaseTag(baseUrl);

      sprite = new Sprite(opts);
      sprite.add(new SpriteSymbol(symbolsFixtures[0]));

      const node = sprite.mount();
      const attrs = collectUrls(node);

      attrs.forEach((attr) => {
        attr.indexOf(`url(${baseUrl}`).should.be.equal(0);
      });

      removeBaseTag();
    });

    it('should subscribe to locationChange event and call updateUrls when it occurs', () => {
      sprite = new Sprite();
      const updateUrls = sinon.spy(sprite, 'updateUrls');

      sprite.mount();

      dispatchCustomEvent(sprite.config.locationChangeEvent, {});
      updateUrls.should.have.been.calledOnce;
    });

    it('should properly move gradients outside symbols', () => {
      sprite = new Sprite({ moveGradientsOutsideSymbol: true, ...opts });
      sprite.add(new SpriteSymbol(symbolsFixtures[0]));
      const node = sprite.mount();

      expect(node.querySelectorAll('symbol linearGradient').length).to.equal(0);
    });
  });

  describe('get isMounted()', () => {
    it('should return true if sprite node exists', () => {
      sprite = new Sprite();
      sprite.isMounted.should.be.false;
      sprite.mount();
      sprite.isMounted.should.be.true;
    });
  });

  describe('_autoConfigure()', () => {
    const opts = { listenLocationChangeEvent: false };

    it('should detect when base tag fix needed', () => {
      const prop = 'syncUrlsWithBaseTag';
      let config;

      config = new Sprite(opts).config;
      config[prop].should.be.false;

      createBaseTag();
      sprite = new Sprite(opts);
      sprite.config[prop].should.be.true;
      sprite.destroy();
      removeBaseTag();

      createBaseTag();
      config = new Sprite({ [prop]: false, ...opts }).config;
      config[prop].should.be.false;
      removeBaseTag();
    });

    it('should detect when Angular base tag fix needed', () => {
      const prop = 'locationChangeAngularEmitter';
      let config;

      config = new Sprite(opts).config;
      config[prop].should.be.false;

      window.angular = mockAngular();
      config = new Sprite(opts).config;
      config[prop].should.be.true;
      delete window.angular;
    });

    it('should not call locationChangeAngularEmitter if window.angular is a getter', () => {
      const prop = 'locationChangeAngularEmitter';
      let config;

      config = new Sprite(opts).config;
      config[prop].should.be.false;

      Object.defineProperty(window, 'angular', {
        get() {},
        configurable: true
      });

      config = new Sprite(opts).config;
      config[prop].should.be.false;
      delete window.angular;
    });

    it('should detect when Firefox gradients fix needed', () => {
      // TODO
    });
  });

  describe('add()', () => {
    it('should call symbol.mount() method only for new symbols', () => {
      sprite = new Sprite();
      const symbol = new SpriteSymbol(symbolFixture);
      const symbolMountMethod = sinon.spy(symbol, 'mount');

      sprite.mount();
      sprite.add(symbol).should.be.true;
      symbolMountMethod.should.have.been.calledOnce;

      sprite.add(symbol).should.be.false;
      symbolMountMethod.should.have.been.calledOnce;
    });
  });

  describe('destroy()', () => {
    it('should destroy all symbols', () => {
      sprite = new Sprite({ moveGradientsOutsideSymbol: true });
      const symbol = new SpriteSymbol(symbolFixture);
      const symbolDestroyMethod = sinon.spy(symbol, 'destroy');

      sprite.add(symbol);
      sprite.mount();
      sprite.destroy();

      symbolDestroyMethod.should.have.been.calledOnce;
    });
  });

  describe('mount()', () => {
    it('should mounts only once', () => {
      const body = document.querySelector('body');
      const container = document.createElement('div');
      container.setAttribute('class', 'container');

      body.appendChild(container);

      sprite = new Sprite({ mountTo: '.container' });
      sprite.add(new SpriteSymbol(symbolFixture));
      sprite.mount();

      container.querySelectorAll('svg').length.should.be.equal(1);

      sprite.mount();
      sprite.mount();

      container.querySelectorAll('svg').length.should.be.equal(1);
      remove(container);
    });
  });

  describe('render()', () => {
    it('should return HTML element', () => {
      sprite = new Sprite();
      sprite.render().should.be.instanceOf(Element);
    });
  });

  describe('unmount()', () => {
    it('should detach sprite element from DOM', () => {
      sprite = new Sprite();
      sprite.mount();

      document.querySelectorAll('svg').length.should.be.equal(1);
      sprite.unmount();
      document.querySelectorAll('svg').length.should.be.equal(0);
    });
  });

  describe('updateUrls()', () => {
    const opts = { listenLocationChangeEvent: false };

    it('should return `false` if sprite not mounted, `true` otherwise', () => {
      sprite = new Sprite(opts);
      sprite.updateUrls().should.be.false;
      sprite.mount();
      sprite.updateUrls().should.be.true;
    });

    it('should update urls in sprite symbols and it\'s references', () => {
      const searchUrl = '#';
      const expectedUrl = '/prefix/#';

      sprite = new Sprite();
      sprite.add(new SpriteSymbol(symbolFixture));
      sprite.mount();

      const ref = createUse(`#${symbolFixture.id}`);
      document.body.appendChild(ref);

      sprite.updateUrls(searchUrl, expectedUrl);
      const attrs = collectUrls(sprite.node);

      attrs.forEach((attr) => {
        attr.indexOf(`url(${expectedUrl}`).should.be.equal(0);
      });

      const refUrl = ref.querySelector('use').getAttributeNS(ns.xlink.uri, 'href');
      refUrl.indexOf(expectedUrl).should.be.equal(0);
    });
  });
});
