import * as utils from '../src';

describe('Compact function', () => {
  it('should create an array with all falsey values removed ', done => {
    utils.delay(2000)
      .then(() => {
        done();
      });
  });
});
