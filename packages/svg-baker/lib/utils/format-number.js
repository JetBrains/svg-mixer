module.exports = function formatNumber(num, decimalPlaces = 2) {
  const hasDecimals = num % 1 !== 0;
  return hasDecimals ? parseFloat(num).toFixed(decimalPlaces) : Math.round(num);
};
