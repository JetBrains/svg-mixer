import merge from 'deepmerge';
import Emitter from 'mitt';
import Sprite from './sprite';
import {
  parse,
  updateSvgUrls,
  browserDetector as browser,
  moveGradientsOutsideSymbol,
  getUrlWithoutFragment,
  angularBaseFix
} from './utils';

const defaultConfig = {
  mountTo: 'body',
  locationUpdateEventName: 'locationUpdate',
  referencesToUpdate: 'use[*|href]',
  baseFix: undefined,
  angularBaseFix: undefined
};

const Events = {
  RENDER: 'render',
  MOUNT: 'mount',
  LOCATION_UPDATE: 'locationUpdate'
};

export default class BrowserSprite extends Sprite {
  constructor(cfg = {}) {
    super(merge(defaultConfig, cfg));

    const config = this.configure(cfg);
    const emitter = this._emitter;

    if (config.baseFix) {
      this.baseUrlFix();
    }
  }

  configure(cfg) {
    const { config } = this;

    this._emitter = Emitter();
    this.node = false;
    this.isMounted = false;

    // Detect when base URL fix is needed
    if (typeof cfg.baseFix === 'undefined') {
      const baseTag = document.getElementsByTagName('base')[0];
      config.baseFix = !!baseTag && baseTag.getAttribute('href') !== null;
    }

    // Detect when Angular base tag fix needed
    if (typeof cfg.angularBaseFix === 'undefined') {
      config.angularBaseFix = 'angular' in window;
    }

    return config;
  }

  /**
   * Fix Firefox bug when gradients and patterns don't work if they are within a symbol
   * @see https://bugzilla.mozilla.org/show_bug.cgi?id=306674
   * @see https://bugzilla.mozilla.org/show_bug.cgi?id=353575
   * @see https://bugzilla.mozilla.org/show_bug.cgi?id=1235364
   */
  firefoxGradientsFix() {
    if (browser.isFirefox) {
      this._emitter.on(Events.RENDER, (node) => {
        moveGradientsOutsideSymbol(node);
      });
    }
  }

  /**
   * Fix disappearing referenced elements when <base href> differs with symbols xlink:href.
   * Should be executed when sprite mounted to DOM.
   * @see http://stackoverflow.com/a/18265336/796152
   * @see https://github.com/everdimension/angular-svg-base-fix
   * @see https://github.com/angular/angular.js/issues/8934#issuecomment-56568466
   */
  baseUrlFix() {
    const emitter = this._emitter;
    const config = this.config;
    const { nativeEventName } = config;

    /**
     * Provide ability to fire
     */
    if (!browser.isIE) {
      window.addEventListener(nativeEventName, (event) => {
        emitter.emit(event.detail);
      });

      if (config.angularBaseFix) {
        angularBaseFix(nativeEventName);
      }
    }

    this._emitter.on(Events.MOUNT, () => {
      const currentURL = getUrlWithoutFragment();
      const baseURL = document.querySelector('base').getAttribute('href');

      if (baseURL !== currentURL) {
        this.updateUrls('#', baseURL);
      }
    });
  }

  /**
   * Update URLs in sprite and referencing elements
   * @param {string} oldUrl
   * @param {string} newUrl
   */
  updateUrls(oldUrl, newUrl) {
    if (!this.isMounted) {
      throw new Error('Sprite should be mounted to apply updateUrls');
    }

    const { referencesToUpdate } = this.config;
    const references = document.querySelectorAll(referencesToUpdate);

    updateSvgUrls(
      this.node,
      references,
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
   * @param {boolean} [prepend=false]
   * @return {Element} rendered sprite element
   */
  mount(prepend = false) {
    const selector = this.config.mountTo;
    const target = document.querySelector(selector);

    if (target === null) {
      throw new Error(`Mount node '${selector}' not found`);
    }

    return this.mountTo(target, prepend);
  }

  /**
   * @param {Element} target
   * @param {boolean} [prepend=false]
   * @return {Element} rendered sprite element
   */
  mountTo(target, prepend = false) {
    const emitter = this._emitter;

    if (this.isMounted) {
      return this.node;
    }

    if (target instanceof Element === false || target.nodeType !== 1) {
      throw new Error('Invalid node type');
    }

    const node = this.render();
    emitter.emit(Events.RENDER, node);

    if (prepend && target.childNodes[0]) {
      target.insertBefore(node, target.childNodes[0]);
    } else {
      target.appendChild(node);
    }

    this.node = node;
    this.isMounted = true;
    emitter.emit(Events.MOUNT, node);

    return node;
  }
}
