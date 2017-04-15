const chai = require('chai');

const utils = require('./utils');

chai.should();

global.utils = utils;
global.expect = chai.expect;
