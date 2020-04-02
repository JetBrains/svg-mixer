const chai = require('chai');

const utils = require('./lib');

chai.should();

global.utils = utils;
global.expect = chai.expect;
