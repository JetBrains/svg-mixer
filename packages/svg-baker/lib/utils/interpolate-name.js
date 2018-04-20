/* eslint-disable arrow-body-style */
const { interpolateName } = require('loader-utils');

module.exports = (name, content) => {
  return name.includes('[hash')
    ? interpolateName({}, name, { content })
    : name;
};
