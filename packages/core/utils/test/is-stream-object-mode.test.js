const utils = require('../lib');
const { Readable, Writable } = require('stream');

describe('Is stream function', () => {
  it('should detect a writable stream object (true)', () => {
    const stream = new Writable({ objectMode: true });
    const result = utils.isStreamObjectMode(stream);

    expect(result).toBe(true);
  });

  it('should detect a stream object (false)', () => {
    const stream = new Readable({ objectMode: true });
    const result = utils.isStreamObjectMode(stream);

    expect(result).toBe(true);
  });

  it('should detect a stream object (false)', () => {
    const stream = new Readable({ objectMode: false });
    const result = utils.isStreamObjectMode(stream);

    expect(result).toBe(false);
  });

  it('should detect a stream object (false)', () => {
    const stream = {};
    const result = utils.isStreamObjectMode(stream);

    expect(result).toBe(false);
  });
});
