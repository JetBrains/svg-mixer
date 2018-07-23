/* eslint-disable no-shadow */

const { parseQuery } = require('loader-utils');
const { isEmpty, cloneDeep } = require('lodash');
const colorParser = require('color-parse');

const { name: packageName } = require('../package.json');

const Rule = require('./rule');

/**
 * @param {string} value
 * @return {{space: string, alpha: number, values: number[]}|null}
 */
function parseColor(value) {
  const parsed = colorParser(value);
  return parsed.space && !isEmpty(parsed.values) ? parsed : null;
}

module.exports.parseColor = parseColor;

function convertAlphaColorsRules(rules) {
  const additionalRules = [];

  const transformedRules = rules.map(rule => {
    const clonedRule = cloneDeep(rule);
    const opacityRule = cloneDeep(rule);

    const fillColor = rule.value && rule.attr && rule.attr === 'fill'
      ? parseColor(rule.value)
      : null;

    const strokeColor = rule.value && rule.attr && rule.attr === 'stroke'
      ? parseColor(rule.value)
      : null;

    if (fillColor && fillColor.alpha < 1) {
      clonedRule.value = `${fillColor.space}(${fillColor.values.join(', ')})`;
      opacityRule.attr = 'fill-opacity';
      opacityRule.value = fillColor.alpha.toString();
      additionalRules.push({ rule: clonedRule, ruleToAppend: opacityRule });
    }

    if (strokeColor && strokeColor.alpha < 1) {
      clonedRule.value = `${strokeColor.space}(${strokeColor.values.join(', ')})`;
      opacityRule.attr = 'stroke-opacity';
      opacityRule.value = strokeColor.alpha.toString();
      additionalRules.push({ rule: clonedRule, ruleToAppend: opacityRule });
    }

    return clonedRule;
  });

  additionalRules.forEach(({ rule, ruleToAppend }) => {
    transformedRules.splice(transformedRules.indexOf(rule) + 1, 0, ruleToAppend);
  });

  return transformedRules;
}

module.exports.convertAlphaColorsRules = convertAlphaColorsRules;

/**
 * @param {Object[]|string} rules
 * @param {Object} options
 * @return {Rule[]}
 */
function normalizeRules(rules, options = {}) {
  let normalized = null;

  // Parse query string to rules
  if (typeof rules === 'string') {
    // Append ? to the beginning so parseQuery able to parse
    const query = rules.substr(0, 1) !== '?' ? `?${rules}` : rules;
    const parsedQuery = parseQuery(query);

    normalized = Object.keys(parsedQuery).reduce((rules, attr) => {
      const value = parsedQuery[attr];
      rules.push(new Rule({ attr, value }));
      return rules;
    }, []);
  } else if (Array.isArray(rules)) {
    normalized = cloneDeep(rules).map(r => new Rule(r));
  } else {
    throw new Error(`${packageName}: rules should be \`Array<Object>|string\``);
  }

  // Split rule with multiple value into several single valued rules
  const replacements = normalized
    .filter(rule => rule.isMultiple)
    .map(rule => ({ rule, replaceTo: rule.splitByMultipleValue() }));

  replacements.forEach(({ rule, replaceTo }) => {
    normalized.splice(...[normalized.indexOf(rule), 1].concat(replaceTo));
  });

  if (options.convertAlphaColors) {
    normalized = convertAlphaColorsRules(normalized);
  }

  return normalized;
}

module.exports.normalizeRules = normalizeRules;
