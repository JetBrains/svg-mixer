function formatNumber(num, decimalPlaces = 2) {
  const hasDecimals = num % 1 !== 0;
  return hasDecimals ? parseFloat(num).toFixed(decimalPlaces) : Math.round(num);
}

class SpriteValue extends Number {
  constructor(value, base) {
    super(value);
    this.base = base;
  }

  static create(value, base) {
    return new SpriteValue(value, base);
  }

  get factor() {
    return this / this.base;
  }

  toPx(decimalPlaces = 2) {
    return this === 0
      ? this.toString()
      : `${formatNumber(this, decimalPlaces)}px`;
  }

  toPercent(decimalPlaces = 2) {
    const percent = this.factor * 100;
    return percent === 0
      ? this.toString()
      : `${formatNumber(percent, decimalPlaces)}%`;
  }
}

module.exports = SpriteValue;
