const proxyquire = require('proxyquire');

function exec(cmd, cb) {
  cb(null, { stdout: cmd });
}

describe('Commiting Forgery', function () {
  let Runner;
  beforeEach(function () {
    const Schmear = proxyquire('../', {
      'child_process': ({ exec })
    });

    Runner = new Schmear();
  });

  it('exposes a class');
  it('formDay');

  describe('buildStack', function () {
    it('does some stuff');
  });

  describe('rebuildRepo', function () {
    it('does some stuff');
  });

  describe('start', function () {
    it('does some stuff');
  });
});
