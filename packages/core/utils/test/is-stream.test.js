const utils = require('../lib');
const { Readable } = require('stream');

describe('Is stream function', () => {
  it('should detect a stream object (true)', () => {
    const readableStream = new Readable();
    const result = utils.isStream(readableStream);

    expect(result).toBe(true);
  });

  it('should detect a stream object (false)', () => {
    const readableStream = Buffer.from('1');
    const result = utils.isStream(readableStream);

    expect(result).toBe(false);
  });
});
