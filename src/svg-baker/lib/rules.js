class Rule {
  constructor({ test, value }) {
    if (!(test instanceof RegExp)) {
      throw new TypeError('`test` should be a regexp');
    }

    this.test = test;
    this.value = value;
  }

  match(value) {
    return this.test(value);
  }
}

class RuleSet {
  constructor(data) {
    if (!Array.isArray(data)) {
      throw new TypeError('`data` should be an array');
    }

    this.rules = data.map(params => new Rule(params));
  }

  getMatchedRule(value) {
    return this.rules.find(rule => rule.match(value)) || null;
  }
}

module.exports = RuleSet;
module.exports.Rule = Rule;
