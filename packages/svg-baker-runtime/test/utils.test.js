import { strictEqual, ok } from 'assert';
import { svg } from 'svg-baker/namespaces';
import {
  parseSVG,
  moveGradientsOutsideSymbol,
  objectToAttrsString as objToAttrs
} from '../lib/utils';

const svgAttrsStr = objToAttrs({
  [svg.name]: svg.value
});

describe('svg-baker-runtime/utils', () => {
  describe('parseSVG', () => {
    it('should return Element instance', () => {
      ok(parseSVG(`<svg ${svgAttrsStr}></svg>`) instanceof Element);
    });
  });

  describe('moveGradientsOutsideSymbol', () => {
    it('should work', () => {
      const testSVG = `<svg ${svgAttrsStr}><defs><symbol><pattern></pattern></symbol></defs></svg>`;
      const expected = `<svg ${svgAttrsStr}><defs><pattern></pattern><symbol></symbol></defs></svg>`;
      const actual = moveGradientsOutsideSymbol(parseSVG(testSVG)).outerHTML;
      strictEqual(actual, expected);
    });

    it('should allow to pass custom selector', () => {
      const testSVG = `<svg ${svgAttrsStr}><defs><symbol><mask /><pattern></pattern></symbol></defs></svg>`;
      const expected = `<svg ${svgAttrsStr}><defs><mask></mask><symbol><pattern></pattern></symbol></defs></svg>`;
      const selector = 'mask';
      const actual = moveGradientsOutsideSymbol(parseSVG(testSVG), selector).outerHTML;
      strictEqual(actual, expected);
    });
  });
});
