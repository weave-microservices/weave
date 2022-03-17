const utils = require('../lib');

describe('Promise delay wrapper', () => {
  it('should reject a promise after timeout', (done) => {
    let p = new Promise((resolve, reject) => {
      setTimeout(() => resolve('value'), 1000);
    });

    p = utils.promiseTimeout(900, p);

    p.catch(error => {
      expect(error.message).toEqual('Promise timed out.');
      done();
    });
  });

  it('should resolve a promise after timeout', (done) => {
    let p = new Promise((resolve, reject) => {
      setTimeout(() => resolve('value'), 1000);
    });

    p = utils.promiseTimeout(1100, p);

    p.then(result => {
      expect(result).toEqual('value');
      done();
    });
  });
});
