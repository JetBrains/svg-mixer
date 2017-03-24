const queryUtils = require('query-string');

class FileRequest {
  /**
   * @param {string} request
   */
  constructor(request) {
    const { file, query } = FileRequest.parse(request);
    this.file = file;
    this.query = query;
  }

  /**
   * @param {string} request
   * @return {{file: string, query: Object}}
   */
  static parse(request) {
    const parts = request.split('?');
    const file = parts[0];
    const query = parts[1] ? queryUtils.parse(parts[1]) : null;
    return { file, query };
  }

  /**
   * @return {string}
   */
  toString() {
    const { file, query } = this;
    const queryEncoded = query ? `?${queryUtils.stringify(query)}` : '';

    return `${file}${queryEncoded}`;
  }

  /**
   * @return {string}
   */
  stringify() {
    return this.toString();
  }

  /**
   * @return {string}
   */
  stringifyQuery() {
    return queryUtils.stringify(this.query);
  }

  /**
   * @param {FileRequest} request
   * @return {boolean}
   */
  equals(request) {
    return this.toString() === request.toString();
  }

  /**
   * @param {FileRequest} request
   * @return {boolean}
   */
  fileEquals(request) {
    return this.file === request.file;
  }

  /**
   * @param {FileRequest} request
   * @return {boolean}
   */
  queryEquals(request) {
    return this.stringifyQuery() === request.stringifyQuery();
  }
}

module.exports = FileRequest;
