import * as utils from '../src';

describe('Promise delay wrapper', () => {
  it('should resolve a promise delayed', (done) => {
    let p = Promise.resolve('value');

    p = utils.promiseDelay(p, 2000);
    p.then(r => {
      expect(r).toBe('value');
      done();
    });
  });
});
