class CssValue extends Number {
  constructor(value, type) {
    super(value);
    this._value = value;
    this.type = type;
  }

  get value() {
    const { type: type, _value: value } = this;
    return type === '%' ? value * 100 : value;
  }

  format(decimalPlaces = 2) {
    const { value } = this;
    const hasDecimals = value % 1 !== 0;
    const formatted = hasDecimals ? parseFloat(value).toFixed(decimalPlaces) : Math.round(value);
    return `${formatted}${this.type}`;
  }
}

module.exports = CssValue;
