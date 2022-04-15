const parseURI = require('../../../src/transport/adapters/fromURI');
describe('URI parser', () => {
  it('should throw an error if the given value is not a string', () => {
    const call = () => parseURI([]);
    expect(call).toThrowError('URI needs to be a string.');
  });

  it('should throw an error if an unknown adapter is given.', () => {
    const call = () => parseURI('invalidAdapter://lcoalhost:27017');
    expect(call).toThrowError('No adapter found.');
  });

  it('should throw an error if an unknown adapter is given.', () => {
    const call = () => parseURI('lcoalhost');
    expect(call).toThrowError('Protocol is missing.');
  });

  it('should return an dummy adapter.', () => {
    const call = () => parseURI('dummy://lcoalhost:27017')();
    expect(typeof call).toBe('function');
  });

  it('should return an TCP adapter.', () => {
    const call = () => parseURI('tcp://lcoalhost:27017')();
    expect(typeof call).toBe('function');
  });
});
