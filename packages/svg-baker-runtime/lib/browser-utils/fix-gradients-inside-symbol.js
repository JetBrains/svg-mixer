import arrayFrom from 'array-from';

const defaultSelector = 'linearGradient, radialGradient, pattern';

/**
 * Fix Firefox bug when gradients and patterns don't work if they are within a symbol
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=306674
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=353575
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=1235364
 *
 * @param {Element} svg
 * @param {string} [selector]
 * @return {Element}
 */
export default function (svg, selector = defaultSelector) {
  arrayFrom(svg.querySelectorAll('symbol')).forEach((symbol) => {
    arrayFrom(symbol.querySelectorAll(selector)).forEach((node) => {
      symbol.parentNode.insertBefore(node, symbol);
    });
  });
  return svg;
}
