/* eslint-disable max-len */
import { strictEqual, ok } from 'assert';
import { wrapWithSVG } from '../lib/utils';
import * as u from '../lib/browser-utils';

const { parseSVG, stringify } = u;

function wrapWithSVGAndParse(content) {
  return parseSVG(wrapWithSVG(content));
}

function createTestFactory(func) {
  return ({ input, expected, args, selector, wrap = true }) => {
    const doc = typeof input === 'string' ?
      parseSVG(wrap ? wrapWithSVG(input) : input) :
      input;

    const nodes = selector ? doc.querySelectorAll(selector) : doc;
    const opts = [nodes].concat(args || []);

    func(...opts);

    const ex = wrap ? wrapWithSVG(expected) : expected;
    const stringifiedResult = stringify(doc);

    strictEqual(
      ex,
      stringifiedResult,
      `Expected: ${ex}\nActual: ${stringifiedResult}`
    );
  };
}

describe('svg-baker-runtime/browser-utils', () => {
  describe('parseSVG()', () => {
    it('should return Element instance', () => {
      ok(parseSVG(wrapWithSVG('<path/>')) instanceof Element);
    });
  });

  describe('stringify()', () => {
    it('should properly serialize single node to string', () => {
      const input = wrapWithSVG('<defs><symbol id="foo"></symbol></defs><use xlink:href="#foo"></use>');
      const doc = parseSVG(input);
      strictEqual(u.stringify(doc), input);
    });

    it('should properly serialize node list to string', () => {
      const expected = '<path id="p1"></path><path id="p2"></path><path id="p3"></path>';
      const doc = wrapWithSVGAndParse(expected);

      strictEqual(
        u.stringify(doc.querySelectorAll('path')),
        expected
      );
    });
  });

  describe('replaceURLInAttributes()', () => {
    const test = ({ input, expected, args, selector }) => {
      const doc = wrapWithSVGAndParse(input);

      u.replaceURLInAttributes(
        u.selectAttributes(doc.querySelectorAll(selector)),
        ...args
      );

      strictEqual(
        stringify(doc),
        wrapWithSVG(expected),
        `Expected: ${wrapWithSVG(expected)}\nActual: ${stringify(doc)}`
      );
    };

    it('should replace URL in specified attributes', () => {
      test({
        input: '<linearGradient id="foo"></linearGradient><path fill="url(#foo)" style="fill:url(#foo);"></path>',
        expected: '<linearGradient id="foo"></linearGradient><path fill="url(bar#foo)" style="fill:url(bar#foo);"></path>',
        selector: 'path',
        args: ['#', 'bar#']
      });
    });

    it('should not modify non matched attributes', () => {
      const input = '<linearGradient id="foo"></linearGradient><path fill="url(bar#foo)" style="fill:url(bar#foo);"></path>';

      test({
        input,
        expected: input,
        selector: '[fill]',
        args: ['qwe2#', 'tralala#']
      });
    });
  });

  describe('updateReferences()', () => {
    const test = createTestFactory(u.updateReferences);

    it('should update references in xlink:href attributes', () => {
      test({
        input: '<path id="foo"></path><use xlink:href="#foo"></use>',
        expected: '<path id="foo"></path><use xlink:href="#bar"></use>',
        args: ['#foo', '#bar'],
        selector: 'use[*|href]'
      });
    });

    it('should not modify non matched attributes', () => {
      const input = '<path id="foo"></path><use xlink:href="#foo"></use>';

      test({
        input,
        expected: input,
        args: ['#qfoo', '#qbar'],
        selector: 'use[*|href]'
      });
    });
  });

  describe('fixGradientsInsideSymbol()', () => {
    const test = createTestFactory(u.fixGradientsInsideSymbol);

    it('should work like a charm', () => {
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

  describe('fixUpdatedURL()', () => {
    const test = createTestFactory(u.fixUpdatedURL);

    it('should work like a charm', () => {
      const input = '<linearGradient id="qwe"></linearGradient><use xlink:href="#qwe"></use>';
      const expected = '<linearGradient id="qwe"></linearGradient><use xlink:href="/path#qwe"></use>';
      const doc = wrapWithSVGAndParse(input);

      test({
        input: doc,
        expected,
        args: [
          doc.querySelectorAll('use'),
          '#',
          '/path#'
        ]
      });
    });
  });
});
