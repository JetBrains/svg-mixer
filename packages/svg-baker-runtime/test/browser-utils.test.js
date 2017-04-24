/* eslint-disable max-len */
import {
  parse,
  stringify,
  wrapInSvg,
  updateSvgUrls,
  selectAttributes,
  objectToAttrsString,
  dispatchCustomEvent,
  getUrlWithoutFragment,
  moveGradientsOutsideSymbol
} from '../src/utils';

function wrapInSvgAndParse(content) {
  return parse(wrapInSvg(content));
}

function createTestFactory(func) {
  return ({ input, expected, args, selector, wrap = true }) => {
    const doc = typeof input === 'string' ?
      parse(wrap ? wrapInSvg(input) : input) :
      input;

    const nodes = selector ? doc.querySelectorAll(selector) : doc;
    const opts = [nodes].concat(args || []);

    func(...opts);

    const ex = wrap ? wrapInSvg(expected) : expected;

    stringify(doc).should.be.equal(ex);
  };
}

describe('svg-baker-runtime/utils', () => {
  describe('dispatchCustomEvent()', () => {
    it('should dispatch', (done) => {
      const eventName = 'qwe';
      const eventDetail = {
        a: 1,
        b: 2
      };

      window.addEventListener(eventName, (e) => {
        e.detail.should.be.deep.equal(eventDetail);
        done();
      });

      dispatchCustomEvent(eventName, eventDetail);
    });
  });

  describe('getUrlWithoutFragment()', () => {
    it('should work', () => {
      getUrlWithoutFragment('http://www.example.com/#qwe')
        .should.be.equal('http://www.example.com/');
    });

    it('should return current URL if no arg provided', () => {
      window.location.hash = '#qwe';
      getUrlWithoutFragment().should.be.equal(window.location.href.split('#')[0]);
      window.location.hash = '';
    });
  });

  describe('moveGradientsOutsideSymbol()', () => {
    const test = createTestFactory(moveGradientsOutsideSymbol);

    it('should work', () => {
      test({
        input: '<defs><symbol><pattern></pattern></symbol></defs>',
        expected: '<defs><pattern></pattern><symbol></symbol></defs>'
      });
    });

    it('should support custom selector', () => {
      test({
        input: '<defs><symbol><mask /><pattern></pattern></symbol></defs>',
        expected: '<defs><mask></mask><symbol><pattern></pattern></symbol></defs>',
        args: ['mask']
      });
    });
  });

  describe('objectToAttrString()', () => {
    it('should properly serialize object to attributes string', () => {
      objectToAttrsString({ fill: 'url("#id")', styles: 'color: #f0f' })
        .should.be.equal('fill="url(&quot;#id&quot;)" styles="color: #f0f"');
    });
  });

  describe('parse()', () => {
    it('should return Element instance', () => {
      parse(wrapInSvg('<path/>')).should.be.instanceOf(Element);
    });
  });

  describe('stringify()', () => {
    it('should properly serialize DOM nodes', () => {
      let input;

      input = wrapInSvg('<defs><symbol id="foo"></symbol></defs><use xlink:href="#foo"></use>');
      stringify(parse(input)).should.be.equal(input);

      input = wrapInSvg('<path id="p1"></path><path id="p2"></path><path id="p3"></path>');
      stringify(parse(input)).should.be.equal(input);
    });
  });

  describe('selectAttributes()', () => {
    it('should work', () => {
      const doc = wrapInSvgAndParse('<path d="" class="q" fill="red" />');
      const result = selectAttributes(doc.querySelectorAll('path'), ({ value }) => value === 'red');
      result.should.be.lengthOf(1);
      result[0].value.should.be.equal('red');
    });
  });

  describe('updateSvgUrls()', () => {
    const test = createTestFactory(updateSvgUrls);

    it('should replace URLs in attributes and references', () => {
      const input = '<linearGradient id="id"></linearGradient><path fill="url(#id)" style="fill:url(#id);"></path><use xlink:href="#id"></use>';
      const expected = '<linearGradient id="id"></linearGradient><path fill="url(prefix#id)" style="fill:url(prefix#id);"></path><use xlink:href="prefix#id"></use>';
      const doc = wrapInSvgAndParse(input);

      test({
        input: doc,
        expected,
        args: [
          doc.querySelectorAll('use'),
          '#',
          'prefix#'
        ]
      });
    });

    it('should not modify non matched attributes and references', () => {
      const input = '<linearGradient id="id"></linearGradient><path fill="url(#id)" style="fill:url(#id);"></path><use xlink:href="#id"></use>';
      const doc = wrapInSvgAndParse(input);

      test({
        input: doc,
        expected: input,
        args: [
          doc.querySelectorAll('use'),
          '#qwe',
          'prefix#qwe'
        ]
      });
    });
  });
});
