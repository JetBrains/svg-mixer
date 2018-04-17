/* eslint-disable no-shadow */
const { parse: parseQuery } = require('query-string');
const slashes = require('slashes');

/**
 * @param {string} expression
 * @return {Array<Array<string>>}
 * @example
 * parseExpression('red #id,  blue .class');
 * // => [ ['red', '#id'], ['blue', '.class'] ]
 */
function parseExpression(expression) {
  const unescaped = slashes.strip(decodeURIComponent(expression));
  return unescaped
    .split(',')
    .filter(val => Boolean(val))
    .map(val => val
      .split(' ')
      .filter(val => Boolean(val))
    );
}

module.exports = query => {
  const queryParams = parseQuery(query);

  return Object.keys(queryParams).reduce((acc, paramName) => {
    const paramValue = queryParams[paramName];

    parseExpression(paramValue).forEach(tokens => {
      acc.push({
        attr: paramName,
        value: tokens[0],
        selector: tokens[1]
      });
    });

    return acc;
  }, []);
};

module.exports.parseExpression = parseExpression;
