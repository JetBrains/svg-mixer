const Request = require('../lib/request');

const f = 'qwe';
const q = 'param=1';
const req = `${f}?${q}`;

describe('svg-baker/request', () => {
  it('static parse()', () => {
    Request.parse('qwe').should.be.an('object')
      .and.have.property('file');
  });

  it('constructor', () => {
    const { file, query } = new Request('qwe');

    expect(file).to.be.a('string');
    expect(query).to.be.null;
    expect(new Request(req).query).to.have.property('param').and.be.equal('1');
  });

  it('toString()', () => {
    expect(new Request(req).toString()).to.be.equal(req);
  });

  it('stringify()', () => {
    expect(new Request(req).stringify()).to.be.equal(req);
  });

  it('stringifyQuery()', () => {
    expect(new Request(req).stringifyQuery()).to.be.equal(q);
  });

  it('equals()', () => {
    expect(new Request(req).equals(new Request(req))).to.be.true;
    expect(new Request(req).equals(new Request(`qwe2?${q}`))).to.be.false;
    expect(() => new Request(req).equals(req)).to.throw;
  });

  it('fileEquals()', () => {
    expect(new Request(req).fileEquals(new Request(req))).to.be.true;
    expect(new Request(req).fileEquals(new Request('qwe2'))).to.be.false;
  });

  it('queryEquals()', () => {
    expect(new Request(req).queryEquals(new Request(req))).to.be.true;
    expect(new Request(req).queryEquals(new Request(`${f}?param2=1`))).to.be.false;
  });

  it('hasParam()', () => {
    const r = new Request(req);
    expect(r.hasParam('param')).to.be.true;
    expect(r.hasParam('param2')).to.be.false;
  });

  it('getParam()', () => {
    const r = new Request(req);
    expect(r.getParam('param')).to.equal('1');
    expect(r.getParam('param2')).to.be.null;
  });
});
