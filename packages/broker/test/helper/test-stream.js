const { Writable } = require('stream');
module.exports = class TestStream extends Writable {
  constructor () {
    super();
    this.chunks = [];
  }
  _write (chunk, encoding, done) {
    // eslint-disable-next-line no-control-regex
    const sanitizedString = chunk.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    this.chunks.push(sanitizedString);
    done();
  }

  getSnapshot () {
    return this.chunks;
  }
};
