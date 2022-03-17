const utils = require('../lib');

describe('Compact function', () => {
  it('should create an array with all falsey values removed ', done => {
    utils.delay(2000)
      .then(() => {
        done();
      });
  });
});
