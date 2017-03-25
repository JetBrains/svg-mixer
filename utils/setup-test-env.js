const chai = require('chai');
const utils = require('./index');

chai.should();

global.jestExpect = global.expect;
global.expect = chai.expect;
global.utils = utils;
