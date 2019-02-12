const valuesParser = require('postcss-values-parser');
const { strip: stripSlashes } = require('slashes');
const unquote = require('unquote');

const CSS_VALUE_TYPE_REGEXP = /^(word|func|number|string)$/;
const NODE_TYPES = {
  WORD: 'word',
  FUNCTION: 'func',
  NUMBER: 'number',
  STRING: 'string',
  COMMA: 'comma'
};

module.exports = class Rule {
  static parseValue(val) {
    const value = stripSlashes(val);
    const root = valuesParser(value).parse();
    const values = [];
    let counter = 0;

    root.first.nodes.forEach(node => {
      switch (node.type) {
        case NODE_TYPES.WORD:
        case NODE_TYPES.FUNCTION:
        case NODE_TYPES.NUMBER:
        case NODE_TYPES.STRING:
          if (!values[counter]) {
            values[counter] = [];
          }
          const nodeValue = node.type === NODE_TYPES.FUNCTION
            ? node.toString().trim()
            : unquote(node.value).trim();
          values[counter].push(nodeValue);
          break;

        case NODE_TYPES.COMMA:
          counter++;
          break;
      }
    });

    return values;
  }

  constructor({ attr, value, selector, tag }) {
    this.attr = attr;
    this.tag = tag;

    const parsedVal = Rule.parseValue(value);
    const isSingleValue = parsedVal.length === 1;
    const isMultipleVal = !isSingleValue;

    if (isSingleValue) {
      this.value = parsedVal[0][0];
      this.selector = unquote(selector) || parsedVal[0][1]; // Override selector from second value part
    } else {
      this.value = parsedVal;
      this.selector = unquote(selector);
    }

    this.isMultiple = isMultipleVal;
  }

  /**
   * @return {Rule[]}
   */
  splitByMultipleValue() {
    return this.value.map(value => new Rule({
      attr: this.attr,
      tag: this.tag,
      value: value[0],
      selector: value[1] || this.selector
    }));
  }
};
