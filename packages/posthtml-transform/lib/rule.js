const valuesParser = require('postcss-values-parser');
const { strip: stripSlashes } = require('slashes');

const CSS_VALUE_TYPE_REGEXP = /^(word|func|number)$/;

module.exports = class Rule {
  static parseValue(value) {
    const root = valuesParser(stripSlashes(value)).parse();
    const values = [];
    let counter = 0;

    root.first.nodes.forEach(node => {
      if (CSS_VALUE_TYPE_REGEXP.test(node.type)) {
        if (!values[counter]) {
          values[counter] = [];
        }
        values[counter].push(node.toString().trim());
      } else if (node.type === 'comma') {
        counter++;
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
      this.selector = selector || parsedVal[0][1]; // Override selector from second value part
    } else {
      this.value = parsedVal;
      this.selector = selector;
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
