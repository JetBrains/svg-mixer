const chai = require('chai');

const utils = require('./utils');

chai.should();

// global.jestExpect = global.expect;
// global.expect = chai.expect;
global.utils = utils;
