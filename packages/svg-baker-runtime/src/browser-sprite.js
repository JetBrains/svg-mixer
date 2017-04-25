import merge from 'deepmerge';
import Emitter from 'mitt';
import Sprite from './sprite';
import defaultConfig from './browser-sprite.config';
import {
  parse,
  moveGradientsOutsideSymbol,
  getUrlWithoutFragment,
  updateUrls,
  locationChangeAngularEmitter
} from './utils';

/**
 * Internal emitter events
 * @enum
 * @private
 */
const Events = {
  RENDER: 'render',
  MOUNT: 'mount'
};

export default class BrowserSprite extends Sprite {
  constructor(cfg = {}) {
    super(merge(defaultConfig, cfg));

    const { config } = this;
    const emitter = Emitter();
    this._emitter = emitter;

    this.node = false;
    this.isMounted = false;

    if (config.syncUrlsWithBaseTag) {
      const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
      emitter.on(Events.MOUNT, () => this.updateUrls('#', baseUrl));
    }

    // Provide way to update sprite urls externally via dispatching custom window event
    window.addEventListener(config.locationChangeEvent, (event) => {
      const { oldUrl, newUrl } = event.detail;
      this.updateUrls(oldUrl, newUrl);
    });

    // Emit location change event in Angular automatically
    if (config.locationChangeAngularEmitter) {
      locationChangeAngularEmitter(config.locationChangeEvent);
    }

    if (config.fixGradientsInFirefox) {
      emitter.on(Events.RENDER, (node) => {
        moveGradientsOutsideSymbol(node);
      });
    }
  }

  /**
   * Update URLs in sprite and usage elements
   * @param {string} oldUrl
   * @param {string} newUrl
   */
  updateUrls(oldUrl, newUrl) {
    if (!this.isMounted) {
      throw new Error('Sprite should be mounted to apply updateUrls');
    }

    const usages = document.querySelectorAll(this.config.usagesToUpdate);

    updateUrls(
      this.node,
      usages,
      `${getUrlWithoutFragment(oldUrl)}#`,
      `${getUrlWithoutFragment(newUrl)}#`
    );
  }

  /**
   * @return {Element}
   */
  render() {
    return parse(this.stringify());
  }

  /**
   * @param {Element|string} target
   * @param {boolean} [prepend=false]
   * @return {Element} rendered sprite element
   */
  mount(target, prepend = false) {
    if (this.isMounted) {
      return this.node;
    }

    const parent = typeof target === 'string' ? document.querySelector(target) : target;
    const emitter = this._emitter;

    const node = this.render();
    emitter.emit(Events.RENDER, node);

    if (prepend && parent.childNodes[0]) {
      parent.insertBefore(node, parent.childNodes[0]);
    } else {
      parent.appendChild(node);
    }

    this.node = node;
    this.isMounted = true;
    emitter.emit(Events.MOUNT, node);

    return node;
  }
}
