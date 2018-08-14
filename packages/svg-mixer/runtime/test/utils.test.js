/* eslint-disable max-len */
import {
  parse,
  stringify,
  wrapInSvgString,
  updateUrls,
  selectAttributes,
  objectToAttrsString,
  dispatchCustomEvent,
  getUrlWithoutFragment,
  moveGradientsOutsideSymbol
} from '../src/utils';

function wrapInSvgAndParse(content) {
  return parse(wrapInSvgString(content));
}

function createTestFactory(func) {
  return ({ input, expected, args, selector, wrap = true }) => {
    const doc = typeof input === 'string' ?
      parse(wrap ? wrapInSvgString(input) : input) :
      input;

    const nodes = selector ? doc.querySelectorAll(selector) : doc;
    const opts = [nodes].concat(args || []);

    func(...opts);

    const ex = wrap ? wrapInSvgString(expected) : expected;
    const actual = stringify(doc);

    if (ex !== actual) {
      const err = new Error('Expected !== actual');
      err.expected = ex;
      err.actual = actual;
      err.showDiff = true;
      throw err;
    }

    // stringify(doc).should.be.equal(ex);
  };
}

describe('svg-mixer-runtime/utils', () => {
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
      parse(wrapInSvgString('<path/>')).should.be.instanceOf(Element);
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

  describe('stringify()', () => {
    it('should properly serialize DOM nodes', () => {
      let input;

      input = wrapInSvgString('<defs><symbol id="foo"></symbol></defs><use xlink:href="#foo"></use>');
      stringify(parse(input)).should.be.equal(input);

      input = wrapInSvgString('<path id="p1"></path><path id="p2"></path><path id="p3"></path>');
      stringify(parse(input)).should.be.equal(input);
    });
  });

  describe('updateUrls()', () => {
    const test = createTestFactory(updateUrls);

    it('should replace URLs in attributes and references', () => {
      const input = '<linearGradient id="id"></linearGradient><path fill="url(#id)" style="fill:url(#id);"></path><use xlink:href="#id"></use>';
      const expected = '<linearGradient id="id"></linearGradient><path fill="url(/prefix#id)" style="fill:url(/prefix#id);"></path><use xlink:href="/prefix#id"></use>';
      const doc = wrapInSvgAndParse(input);

      test({
        input: doc,
        expected,
        args: [
          doc.querySelectorAll('use'),
          '#',
          '/prefix#'
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
          '/prefix#qwe'
        ]
      });
    });

    it('should handle special chars properly', () => {
      const input = '<linearGradient id="id"></linearGradient><path fill="url(#id)" style="fill:url(#id);"></path><use xlink:href="#id"></use>';
      const expected = '<linearGradient id="id"></linearGradient><path fill="url(inbox/33(popup:compose)?q=123%7B%7D#id)" style="fill:url(inbox/33(popup:compose)?q=123%7B%7D#id);"></path><use xlink:href="inbox/33(popup:compose)?q=123%7B%7D#id"></use>';
      const doc = wrapInSvgAndParse(input);

      test({
        input: doc,
        expected,
        args: [
          doc.querySelectorAll('use'),
          '#',
          'inbox/33(popup:compose)?q=123{}#'
        ]
      });
    });

    it('should handle multiple urls in the same attribute', () => {
      const input = '<linearGradient id="id"></linearGradient><path style="fill: url(#id); mask: url(#id2);"></path><use xlink:href="#id"></use><use xlink:href="#id2"></use>';
      const expected = '<linearGradient id="id"></linearGradient><path style="fill: url(/prefix#id); mask: url(/prefix#id2);"></path><use xlink:href="/prefix#id"></use><use xlink:href="/prefix#id2"></use>';
      const doc = wrapInSvgAndParse(input);

      test({
        input: doc,
        expected,
        args: [
          doc.querySelectorAll('use'),
          '#',
          '/prefix#'
        ]
      });
    });
  });
});
