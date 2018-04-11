const { format } = require('util');

const CODES = {
  NOT_FOUND: 'NOT_FOUND',
  NOT_A_FILE: 'NOT_A_FILE'
};

const MESSAGES = {
  NOT_FOUND: 'File not found: %s',
  NOT_A_FILE: 'Resource is not a file: %s'
};

module.exports = class ResolveError extends Error {
  constructor(path, code) {
    super();
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error()).stack;
    }

    this.code = code;
    this.path = path;
    this.message = format(MESSAGES[code], path);
  }
};

module.exports.CODES = CODES;
