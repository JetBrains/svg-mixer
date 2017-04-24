import merge from 'deepmerge';
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
  locationUpdatedEventName: 'locationUpdated',
  referencesToUpdate: 'use[*|href]',
  baseFix: undefined,
  angularBaseFix: undefined
};

export default class BrowserSprite extends Sprite {
  constructor(cfg) {
    super(merge(defaultConfig, cfg || {}));
    const { config } = this;

    this.node = false;
    this.isMounted = false;

    /**
     * Autodetect is base URL fix is needed
     */
    if (config.baseFix === undefined) {
      const baseTag = document.getElementsByTagName('base')[0];
      this.baseFix = baseTag && baseTag.getAttribute('href') !== null;
    }

    /**
     * Fix broken elements after window.history.pushState occurs
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=652991
     */
    if (!browser.isIE) {
      const eventName = config.locationUpdatedEventName;

      window.addEventListener(eventName, (event) => {
        this.updateUrls(event.detail.oldURL, event.detail.newURL);
      });

      if (
          (config.angularBaseFix === undefined && 'angular' in window) ||
          config.angularBaseFix === true
      ) {
        angularBaseFix(eventName);
      }
    }
  }

  /**
   * Update URLs in sprite and referencing elements
   * @param {string} oldURL
   * @param {string} newURL
   */
  updateUrls(oldURL, newURL) {
    if (!this.isMounted) {
      throw new Error('Sprite should be mounted to apply updateUrls');
    }

    const { referencesToUpdate } = this.config;

    const searchURL = `${getUrlWithoutFragment(oldURL)}#`;
    const replaceURL = `${getUrlWithoutFragment(newURL)}#`;
    const references = document.querySelectorAll(referencesToUpdate);

    updateSvgUrls(this.node, references, searchURL, replaceURL);
  }

  /**
   * Fix disappearing referenced elements when <base href> differs with symbols xlink:href
   * @see http://stackoverflow.com/a/18265336/796152
   * @see https://github.com/everdimension/angular-svg-base-fix
   * @see https://github.com/angular/angular.js/issues/8934#issuecomment-56568466
   */
  baseFix() {
    const currentURL = getUrlWithoutFragment();
    const baseURL = document.querySelector('base').getAttribute('href');

    if (baseURL !== currentURL) {
      this.updateUrls('#', baseURL);
    }
  }

  /**
   * @return {Element}
   */
  render() {
    const svg = parse(this.stringify());

    /**
     * Fix Firefox bug when gradients and patterns don't work if they are within a symbol
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=306674
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=353575
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=1235364
     */
    if (browser.isFirefox) {
      moveGradientsOutsideSymbol(svg);
    }

    return svg;
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
    if (this.isMounted) {
      return this.node;
    }

    if (target instanceof Element === false || target.nodeType !== 1) {
      throw new Error('Invalid node type');
    }

    const node = this.render();

    if (prepend && target.childNodes[0]) {
      target.insertBefore(node, target.childNodes[0]);
    } else {
      target.appendChild(node);
    }

    this.node = node;
    this.isMounted = true;

    if (this.config.baseFix) {
      this.baseFix();
    }

    return node;
  }
}
