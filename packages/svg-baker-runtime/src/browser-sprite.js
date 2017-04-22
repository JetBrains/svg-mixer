import merge from 'deepmerge';
import Sprite from './sprite';

import {
  parseSVG,
  browserDetector as browser,
  updateBaseURLInSVG,
  moveGradientsOutsideSymbol,
  getURLWithoutFragment
} from './browser-utils';

export const defaultConfig = {
  locationUpdatedEventName: 'locationUpdated',
  referencesToUpdate: 'use[*|href]',
  baseURLFix: undefined
};

export default class BrowserSprite extends Sprite {
  constructor(config) {
    super(merge(defaultConfig, config || {}));

    this.node = false;
    this.isMounted = false;

    /**
     * Autodetect is base URL fix needed
     */
    if (typeof this.config.baseURLFix === 'undefined') {
      const baseTag = document.getElementsByTagName('base')[0];
      this.baseURLFix = baseTag && baseTag.getAttribute('href') !== null;
    }

    /**
     * Fix broken elements after window.history.pushState occurs
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=652991
     */
    if (!browser.isIE) {
      const eventName = this.config.locationUpdatedEventName;
      window.addEventListener(eventName, (event) => {
        this.updateURL(event.detail.oldURL, event.detail.newURL);
      });
    }
  }

  /**
   * Update URLs in sprite and referencing elements
   * @param {string} startsWith
   * @param {string} newURL
   */
  updateURL(startsWith, newURL) {
    if (!this.isMounted) {
      throw new Error('Sprite should be mounted to apply updateBaseURLInSVG');
    }

    const { referencesToUpdate } = this.config;

    const searchURL = `${getURLWithoutFragment(startsWith)}#`;
    const replaceURL = `${getURLWithoutFragment(newURL)}#`;
    const references = document.querySelectorAll(referencesToUpdate);

    updateBaseURLInSVG(this.node, references, searchURL, replaceURL);
  }

  /**
   * Fix disappearing referenced elements when <base href> differs with symbols xlink:href
   * @see http://stackoverflow.com/a/18265336/796152
   * @see https://github.com/everdimension/angular-svg-base-fix
   * @see https://github.com/angular/angular.js/issues/8934#issuecomment-56568466
   */
  baseURLFix() {
    const currentURL = getURLWithoutFragment();
    const baseURL = document.querySelector('base').getAttribute('href');

    if (baseURL !== currentURL) {
      this.updateURL('#', baseURL);
    }
  }

  /**
   * @return {Element}
   */
  render() {
    const svg = parseSVG(this.stringify());

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
   * @param {Element} target
   * @param {boolean} [prepend=false]
   */
  mount(target, prepend = false) {
    if (this.isMounted) {
      return;
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

    if (this.config.baseURLFix) {
      this.baseURLFix();
    }
  }
}
