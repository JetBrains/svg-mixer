import ns from 'svg-baker/namespaces';
import Sprite from '../src/browser-sprite';
import SpriteSymbol from '../src/browser-symbol';
import { createBaseTag, removeBaseTag, mockAngular, createUse, collectUrls } from './_utils';
import { dispatchCustomEvent } from '../src/utils';

/**
 * @type {Array}
 */
const symbolsFixtures = require('./fixtures/data.json');

const symbolData = symbolsFixtures[0];

describe('svg-baker-runtime/browser-sprite', () => {
  describe('constructor()', () => {
    const opts = { listenLocationChangeEvent: false };

    it('should assign default config properly', () => {
      const sprite = new Sprite({ qwe: 123, ...opts });

      sprite.config.should.have.property('attrs');
      sprite.config.should.have.property('qwe');
      sprite.node.should.be.false;
      sprite.isMounted.should.be.false;
    });

    it('should sync sprite urls with base tag url when sprite is mounted', () => {
      const baseUrl = window.location.href;
      createBaseTag(baseUrl);

      const sprite = new Sprite(opts);
      sprite.add(new SpriteSymbol(symbolsFixtures[0]));

      const node = sprite.mount();
      const attrs = collectUrls(node);

      attrs.forEach((attr) => {
        attr.indexOf(`url(${baseUrl}`).should.be.equal(0);
      });

      removeBaseTag();
    });

    it('should subscribe to locationChange event and call updateUrls when it occurs', () => {
      const sprite = new Sprite();
      const updateUrls = sinon.spy(sprite, 'updateUrls');

      sprite.mount();

      dispatchCustomEvent(sprite.config.locationChangeEvent, {});
      updateUrls.should.have.been.calledOnce;

      updateUrls.restore();
      sprite.destroy();
    });

    it('should properly move gradients outside symbols', () => {
      const sprite = new Sprite({ moveGradientsOutsideSymbol: true, ...opts });
      sprite.add(new SpriteSymbol(symbolsFixtures[0]));
      const node = sprite.mount();

      expect(node.querySelectorAll('symbol linearGradient').length).to.equal(0);
      sprite.destroy();
    });
  });

  describe('autoConfigure()', () => {
    const opts = { listenLocationChangeEvent: false };

    it('should detect when base tag fix needed', () => {
      const prop = 'syncUrlsWithBaseTag';
      let config;

      config = new Sprite(opts).config;
      config[prop].should.be.false;

      createBaseTag();
      const sprite = new Sprite(opts);
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

    it('should detect when Firefox gradients fix needed', () => {
      // TODO
    });
  });

  describe('updateUrls()', () => {
    const opts = { listenLocationChangeEvent: false };

    it('should throw if sprite isn\'t mounted', () => {
      const sprite = new Sprite(opts);
      expect(() => sprite.updateUrls()).to.throw();
    });

    it('should update urls in sprite symbols and in references', () => {
      const searchUrl = '#';
      const expectedUrl = '/prefix/#';

      const sprite = new Sprite();
      sprite.add(new SpriteSymbol(symbolData));
      sprite.mount();

      const ref = createUse(`#${symbolData.id}`);
      document.body.appendChild(ref);

      sprite.updateUrls(searchUrl, expectedUrl);
      const attrs = collectUrls(sprite.node);

      attrs.forEach((attr) => {
        attr.indexOf(`url(${expectedUrl}`).should.be.equal(0);
      });

      const refUrl = ref.querySelector('use').getAttributeNS(ns.xlink.uri, 'href');
      refUrl.indexOf(expectedUrl).should.be.equal(0);

      sprite.destroy();
    });
  });

  describe('mount()', () => {
    it('should mounts only once', () => {
      const body = document.querySelector('body');
      const container = document.createElement('div');
      container.setAttribute('class', 'container');

      body.appendChild(container);

      const sprite = new Sprite({ mountTo: '.container' });
      sprite.add(new SpriteSymbol(symbolData));
      sprite.mount();

      container.querySelectorAll('svg').length.should.be.equal(1);

      sprite.mount();
      sprite.mount();

      container.querySelectorAll('svg').length.should.be.equal(1);
    });
  });
});
